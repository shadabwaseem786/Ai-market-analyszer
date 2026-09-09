/*
 V410000 F&O OPPORTUNITY RANKING + CAPITAL/RISK ALLOCATION ENGINE
 Ranks eligible opportunities by quality, expected move, risk/reward, liquidity,
 regime fit, catalyst strength and model agreement. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function norm(o={}){
    return {
      symbol:o.symbol||"UNKNOWN",
      assetClass:o.assetClass||"FNO",
      decision:["BUY","SELL","WAIT","NO-TRADE"].includes(String(o.decision||"WAIT").toUpperCase())
        ?String(o.decision||"WAIT").toUpperCase():"WAIT",
      probability:clamp(n(o.probability,.5),0,1),
      expectedMove:Math.max(0,n(o.expectedMove,0)),
      riskReward:Math.max(0,n(o.riskReward,1)),
      signalQuality:clamp(n(o.signalQuality,50),0,100),
      liquidity:clamp(n(o.liquidity,50),0,100),
      regimeFit:clamp(n(o.regimeFit,50),0,100),
      catalystStrength:clamp(n(o.catalystStrength,50),0,100),
      modelAgreement:clamp(n(o.modelAgreement,50),0,100),
      dataQuality:clamp(n(o.dataQuality,50),0,100),
      volatilityRisk:clamp(n(o.volatilityRisk,50),0,100),
      maxRiskPct:Math.max(0,n(o.maxRiskPct,1)),
      lotValue:Math.max(0,n(o.lotValue,0))
    };
  }

  function opportunityScore(o){
    const x=norm(o);
    const rr=clamp(x.riskReward/3,0,1)*100;
    const move=clamp(x.expectedMove/5,0,1)*100;
    const riskPenalty=x.volatilityRisk;
    const score=
      .22*x.probability*100+
      .14*move+
      .14*rr+
      .13*x.signalQuality+
      .10*x.liquidity+
      .10*x.regimeFit+
      .07*x.catalystStrength+
      .06*x.modelAgreement+
      .04*x.dataQuality-
      .10*riskPenalty;
    return {...x,opportunityScore:clamp(score,0,100)};
  }

  function rank(opportunities=[], opts={}){
    const rows=opportunities.map(opportunityScore)
      .filter(x=>x.dataQuality>=n(opts.minDataQuality,55))
      .filter(x=>x.decision!=="NO-TRADE")
      .sort((a,b)=>b.opportunityScore-a.opportunityScore);
    return rows.map((x,i)=>({...x,rank:i+1}));
  }

  function riskBudget(capital, maxPortfolioRiskPct=1){
    return Math.max(0,n(capital,0)*clamp(n(maxPortfolioRiskPct,1),0,100)/100);
  }

  function allocation(opportunity, capital, opts={}){
    const x=opportunityScore(opportunity);
    const budget=riskBudget(capital,opts.maxPortfolioRiskPct||1);
    const perTradePct=clamp(n(x.maxRiskPct,opts.defaultTradeRiskPct||.5),.05,n(opts.maxTradeRiskPct||1,1));
    const riskCapital=budget*perTradePct/Math.max(.01,n(opts.maxPortfolioRiskPct||1));
    const lotValue=x.lotValue;
    const lots=lotValue>0?Math.floor(riskCapital/lotValue):0;
    return {
      symbol:x.symbol,
      eligible:x.opportunityScore>=n(opts.minScore,70)&&x.probability>=n(opts.minProbability,.60),
      recommendedRiskCapital:Math.max(0,riskCapital),
      riskPercentOfPortfolio:perTradePct,
      indicativeLots:lots,
      note:"Indicative sizing only; does not account for broker margin, slippage, liquidity, concentration, or live execution constraints."
    };
  }

  function portfolioRank(opportunities=[],capital=0,opts={}){
    const ranked=rank(opportunities,opts);
    const selected=ranked.slice(0,n(opts.maxPositions,5));
    return {
      ranked,
      selected:selected.map(x=>({...x,allocation:allocation(x,capital,opts)}))
    };
  }

  global.OpportunityEngineV410000={norm,opportunityScore,rank,riskBudget,allocation,portfolioRank};
})(typeof globalThis!=="undefined"?globalThis:window);
