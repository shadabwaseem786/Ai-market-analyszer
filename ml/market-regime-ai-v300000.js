/*
 V300000 MARKET REGIME INTELLIGENCE + REGIME-SWITCHING AI
 Classifies market regime and adapts specialist weights.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  const REGIMES=[
    "TREND_BULL","TREND_BEAR","RANGE","HIGH_VOLATILITY",
    "PANIC_RISK_OFF","LOW_VOLATILITY","TRANSITION"
  ];

  function classify(features={}){
    const trend=n(features.trend,0);
    const adx=n(features.adx,20);
    const vol=n(features.volatility,20);
    const volPercentile=n(features.volPercentile,50);
    const breadth=n(features.breadth,50);
    const gap=n(features.gap,0);
    const liquidity=n(features.liquidity,70);

    if(volPercentile>=92 || (Math.abs(gap)>=3 && liquidity<45))
      return {regime:"PANIC_RISK_OFF",confidence:90};
    if(volPercentile>=75 || vol>=35)
      return {regime:"HIGH_VOLATILITY",confidence:82};
    if(volPercentile<=18 && vol<=15)
      return {regime:"LOW_VOLATILITY",confidence:80};
    if(adx>=25 && trend>=1.2 && breadth>=58)
      return {regime:"TREND_BULL",confidence:84};
    if(adx>=25 && trend<=-1.2 && breadth<=42)
      return {regime:"TREND_BEAR",confidence:84};
    if(adx<20 && Math.abs(trend)<1 && breadth>=40 && breadth<=60)
      return {regime:"RANGE",confidence:78};
    return {regime:"TRANSITION",confidence:62};
  }

  function adaptiveWeights(models=[], regime="TRANSITION"){
    return models.map(m=>{
      const r=m.regimes?.[regime]||{};
      const base=n(m.weight,1);
      const rw=n(r.weight,1);
      const calibration=n(r.calibration,m.calibration||50);
      return {...m,regimeWeight:Math.max(.05,base*rw),regimeCalibration:calibration};
    }).sort((a,b)=>(b.regimeCalibration*b.regimeWeight)-(a.regimeCalibration*a.regimeWeight));
  }

  function regimeTransition(previous,current){
    if(!previous || previous===current) return {changed:false,transitionPenalty:0};
    return {changed:true,transitionPenalty:20,from:previous,to:current};
  }

  function regimeGate(input={}){
    const r=input.regime||"TRANSITION";
    const confidence=clamp(n(input.regimeConfidence,50),0,100);
    const transition=!!input.transition;
    if(transition || r==="PANIC_RISK_OFF") return "WAIT";
    if(confidence<55) return "WAIT";
    return "ACTIVE";
  }

  function snapshot(features={}, previousRegime=null){
    const c=classify(features);
    const t=regimeTransition(previousRegime,c.regime);
    return {...c,...t,gate:regimeGate({regime:c.regime,regimeConfidence:c.confidence,transition:t.changed})};
  }

  global.RegimeAIv300000={REGIMES,classify,adaptiveWeights,regimeTransition,regimeGate,snapshot};
})(typeof globalThis!=="undefined"?globalThis:window);
