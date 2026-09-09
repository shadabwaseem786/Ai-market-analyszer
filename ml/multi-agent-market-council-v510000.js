/*
 V510000 MULTI-AGENT MARKET COUNCIL + CONSENSUS ENGINE
 Independent specialist opinions, reliability weighting, disagreement intelligence,
 and chief-decision arbitration. Research/inference only.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function normalize(a={}){
    const d=String(a.direction||"WAIT").toUpperCase();
    return {id:a.id||a.name||"agent",name:a.name||a.id||"agent",family:a.family||"specialist",
      direction:["BUY","SELL","WAIT","NO-TRADE"].includes(d)?d:"WAIT",
      probability:clamp(n(a.probability,.5),0,1),
      reliability:clamp(n(a.reliability,50),0,100),
      regimeFit:clamp(n(a.regimeFit,50),0,100),
      calibration:clamp(n(a.calibration,50),0,100),
      contradiction:clamp(n(a.contradiction,0),0,100),
      enabled:a.enabled!==false};
  }

  function agentScore(a){
    const x=normalize(a);
    return {...x,score:clamp(.35*x.reliability+.25*x.calibration+
      .20*x.regimeFit+.20*(100-x.contradiction),0,100)};
  }

  function council(agents=[]){
    const rows=agents.map(agentScore).filter(x=>x.enabled);
    const totals={BUY:0,SELL:0,WAIT:0,"NO-TRADE":0};
    rows.forEach(x=>totals[x.direction]+=Math.max(1,x.score));
    const total=Object.values(totals).reduce((a,b)=>a+b,0)||1;
    const shares=Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,v/total]));
    const ranked=rows.sort((a,b)=>b.score-a.score);
    const top=ranked[0];
    const max=Math.max(...Object.values(shares));
    const runner=Object.entries(shares).sort((a,b)=>b[1]-a[1])[1]?.[1]||0;
    const disagreement=clamp((1-(max-runner))*100,0,100);
    return {agents:ranked,totals,shares,leader:top?.direction||"WAIT",
      disagreement,consensusStrength:clamp(max*100,0,100)};
  }

  function arbitrate(input={}){
    const c=council(input.agents||[]);
    let decision=c.leader;
    const highRisk=(input.highReliabilityContradiction||false);
    if(c.disagreement>=55 || highRisk) decision="WAIT";
    if(c.shares["NO-TRADE"]>=.40) decision="NO-TRADE";
    if(input.redTeamFail===true || input.dataBlocked===true) decision="NO-TRADE";
    return {...c,decision};
  }

  function debate(input={}){
    const a=arbitrate(input);
    const reasons=[];
    if(a.disagreement>=55) reasons.push("HIGH_AGENT_DISAGREEMENT");
    if(input.highReliabilityContradiction) reasons.push("HIGH_RELIABILITY_CONTRADICTION");
    if(input.redTeamFail) reasons.push("RED_TEAM_FAILURE");
    if(input.dataBlocked) reasons.push("DATA_TRUST_BLOCK");
    return {...a,reasons};
  }

  global.MarketCouncilV510000={normalize,agentScore,council,arbitrate,debate};
})(typeof globalThis!=="undefined"?globalThis:window);
