/*
 V800000 ADAPTIVE ENSEMBLE + REGIME + CALIBRATION + RISK SENTINEL
 Batch upgrade for robust decision fusion.
 Research/inference only. No automatic order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
  const sigmoid=x=>1/(1+Math.exp(-x));

  function regimeClassifier(x={}){
    const trend=n(x.trend), vol=n(x.volatility), breadth=n(x.breadth);
    let regime="NEUTRAL";
    if(trend>60 && vol<45 && breadth>55) regime="TREND_UP";
    else if(trend<-60 && vol<45 && breadth<45) regime="TREND_DOWN";
    else if(vol>70) regime="HIGH_VOLATILITY";
    else if(Math.abs(trend)<25 && vol<45) regime="RANGE";
    else if(breadth>70) regime="BROAD_RISK_ON";
    else if(breadth<30) regime="BROAD_RISK_OFF";
    return {regime,trend,volatility:vol,breadth};
  }

  function ensemble(models=[],regime="NEUTRAL"){
    const rows=models.map(m=>{
      const base=clamp(n(m.confidence,50),0,100)/100;
      const regimeFit=clamp(n(m.regimeFit?.[regime],50),0,100)/100;
      const reliability=clamp(n(m.reliability,50),0,100)/100;
      const w=Math.max(.01,base*.45+regimeFit*.35+reliability*.20);
      return {...m,effectiveWeight:w};
    });
    const total=rows.reduce((s,m)=>s+m.effectiveWeight,0)||1;
    const score=rows.reduce((s,m)=>s+n(m.signal,0)*m.effectiveWeight,0)/total;
    return {models:rows,score:clamp(score,-100,100),
      agreement:rows.length?rows.filter(m=>Math.sign(m.signal)===Math.sign(score)).length/rows.length*100:0};
  }

  function riskSentinel(x={}){
    const volatility=clamp(n(x.volatility,50),0,100);
    const liquidity=clamp(n(x.liquidity,50),0,100);
    const eventRisk=clamp(n(x.eventRisk,0),0,100);
    const dataRisk=clamp(n(x.dataRisk,0),0,100);
    const correlation=clamp(n(x.correlationRisk,0),0,100);
    const risk=.30*volatility+.20*(100-liquidity)+.25*eventRisk+.15*dataRisk+.10*correlation;
    return {score:clamp(risk,0,100),
      level:risk>=75?"EXTREME":risk>=55?"HIGH":risk>=35?"MEDIUM":"LOW"};
  }

  function confidence(score,agreement,quality,uncertainty){
    const raw=clamp(.45*Math.abs(n(score))+ .25*n(agreement)+
      .20*n(quality)-.20*n(uncertainty),0,100);
    return {raw,band:raw>=80?"HIGH":raw>=60?"MEDIUM":"LOW"};
  }

  function resolve(x={}){
    const regime=regimeClassifier(x.regime||x);
    const ens=ensemble(x.models||[],regime.regime);
    const risk=riskSentinel(x.risk||x);
    const conf=confidence(ens.score,ens.agreement,n(x.quality,100),n(x.uncertainty,0));
    let decision=ens.score>=n(x.threshold,55)?"BUY":
      ens.score<=-n(x.threshold,55)?"SELL":"WAIT";
    if(risk.level==="EXTREME" || conf.band==="LOW" || x.dataBlocked===true) decision="NO-TRADE";
    else if(ens.agreement<45) decision="WAIT";
    return {regime,ensemble:ens,risk,confidence:conf,decision};
  }

  global.AdaptiveEnsembleV800000={regimeClassifier,ensemble,riskSentinel,confidence,resolve};
})(typeof globalThis!=="undefined"?globalThis:window);
