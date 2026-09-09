/*
 V450000 ADAPTIVE SIGNAL THRESHOLD + FALSE-SIGNAL FILTER ENGINE
 Selective decision gating using calibration, regime, liquidity, volatility,
 data health, model agreement and catalyst state. Research/inference only.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function baseThreshold(ctx={}){
    const regime=String(ctx.regime||"TRANSITION");
    const base={
      TRENDING_UP:.68,TRENDING_DOWN:.68,RANGE:.74,BREAKOUT:.70,
      PANIC:.88,EVENT:.86,LOW_VOL_COMPRESSION:.71,LOW_LIQUIDITY:.90,TRANSITION:.80
    }[regime] ?? .80;
    return base;
  }

  function adaptiveThreshold(ctx={}){
    let t=baseThreshold(ctx);
    const vol=n(ctx.volatility,50);
    const liquidity=n(ctx.liquidity,70);
    const modelAgreement=n(ctx.modelAgreement,70);
    const calibration=n(ctx.calibration,70);
    const dataQuality=n(ctx.dataQuality,80);
    const driftHealth=n(ctx.driftHealth,80);
    const catalystConflict=n(ctx.catalystConflict,0);
    if(vol>=80)t+=.05;
    if(liquidity<40)t+=.06;
    if(modelAgreement<60)t+=.05;
    if(calibration<60)t+=.04;
    if(dataQuality<70)t+=.05;
    if(driftHealth<60)t+=.06;
    if(catalystConflict>=60)t+=.05;
    return clamp(t,.55,.97);
  }

  function falseSignalScore(ctx={}){
    let risk=0;
    risk += n(ctx.dataQuality<70?15:0);
    risk += n(ctx.driftHealth<60?15:0);
    risk += n(ctx.modelAgreement<55?15:0);
    risk += n(ctx.liquidity<40?15:0);
    risk += n(ctx.volatility>85?10:0);
    risk += n(ctx.catalystConflict>60?15:0);
    risk += n(ctx.recentFailureRate,0)*.30;
    risk += n(ctx.slippageRisk,0)*.15;
    return clamp(risk,0,100);
  }

  function gate(input={}){
    const p=clamp(n(input.probability,.5),0,1);
    const threshold=adaptiveThreshold(input);
    const falseRisk=falseSignalScore(input);
    const direction=String(input.direction||"WAIT").toUpperCase();
    let decision="WAIT";
    if(direction==="NO-TRADE") decision="NO-TRADE";
    else if(falseRisk>=75) decision="NO-TRADE";
    else if(p>=threshold && falseRisk<55) decision=direction==="SELL"?"SELL":"BUY";
    else if(p>=threshold-.04 && falseRisk<35) decision=direction==="SELL"?"SELL":"BUY";
    const confidence=clamp(p*100-(falseRisk*.35),0,100);
    return {decision,threshold,probability:p,falseSignalRisk:falseRisk,confidence};
  }

  function evaluateMany(rows=[],ctx={}){
    return rows.map(x=>({...x,...gate({...ctx,...x})}))
      .sort((a,b)=>b.confidence-a.confidence);
  }

  global.AdaptiveSignalEngineV450000={baseThreshold,adaptiveThreshold,falseSignalScore,gate,evaluateMany};
})(typeof globalThis!=="undefined"?globalThis:window);
