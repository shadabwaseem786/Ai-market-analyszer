/*
 V260000 MULTI-ASSET OPPORTUNITY & RISK ORCHESTRATOR
 Ranks opportunities using quality, reward/risk, freshness, liquidity,
 model agreement, cross-market confirmation and portfolio concentration.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function opportunityScore(x={}){
    const confidence=clamp(n(x.confidence,50),0,100);
    const rr=clamp(n(x.rewardRisk,1),0,10);
    const freshness=clamp(n(x.freshness,50),0,100);
    const liquidity=clamp(n(x.liquidity,50),0,100);
    const agreement=clamp(n(x.agreement,50),0,100);
    const crossMarket=clamp(n(x.crossMarket,50),0,100);
    const eventRisk=clamp(n(x.eventRisk,50),0,100);
    const concentration=clamp(n(x.concentration,0),0,100);

    const rewardScore=clamp(rr/3*100,0,100);
    return clamp(
      confidence*.28 + rewardScore*.18 + freshness*.12 +
      liquidity*.10 + agreement*.12 + crossMarket*.10 -
      eventRisk*.05 - concentration*.05,0,100
    );
  }

  function correlationPenalty(candidate, portfolio=[]){
    const ids=new Set(candidate.correlationTags||[]);
    if(!ids.size)return 0;
    let overlap=0;
    for(const p of portfolio){
      const tags=p.correlationTags||[];
      if(tags.some(t=>ids.has(t))) overlap++;
    }
    return clamp(overlap*12,0,45);
  }

  function rankUniverse(universe=[], portfolio=[]){
    return universe.map(x=>{
      const base=opportunityScore(x);
      const corr=correlationPenalty(x,portfolio);
      const score=clamp(base-corr,0,100);
      const risk=n(x.riskScore,50);
      let action="WAIT";
      if(x.stale || n(x.dataQuality,100)<60) action="NO-TRADE";
      else if(risk>=85) action="NO-TRADE";
      else if(score>=72 && String(x.direction).toUpperCase()==="BUY") action="BUY";
      else if(score>=72 && String(x.direction).toUpperCase()==="SELL") action="SELL";
      return {...x,opportunityScore:score,correlationPenalty:corr,action};
    }).sort((a,b)=>b.opportunityScore-a.opportunityScore);
  }

  function topN(universe, nResults=10, portfolio=[]){
    return rankUniverse(universe,portfolio).slice(0,Math.max(1,nResults));
  }

  function portfolioRisk(positions=[]){
    if(!positions.length)return {score:0,level:"LOW",sectorConcentration:0};
    const sectors={};
    for(const p of positions){
      const s=p.sector||"UNKNOWN";
      sectors[s]=(sectors[s]||0)+Math.max(0,n(p.weight,0));
    }
    const maxSector=Math.max(...Object.values(sectors),0);
    const score=clamp(
      positions.reduce((s,p)=>s+n(p.riskScore,50),0)/positions.length*.7+
      maxSector*.3,0,100
    );
    return {score,level:score>=75?"HIGH":score>=50?"MEDIUM":"LOW",sectorConcentration:maxSector};
  }

  global.OpportunityOrchestratorV260000={
    opportunityScore,correlationPenalty,rankUniverse,topN,portfolioRisk
  };
})(typeof globalThis!=="undefined"?globalThis:window);
