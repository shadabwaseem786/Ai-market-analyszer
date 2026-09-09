/*
 V530000 UNCERTAINTY QUANTIFICATION + PROBABILITY CALIBRATION 2.0
 Separates directional probability from uncertainty and risk.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function entropy(p){
    p=clamp(p,1e-9,1-1e-9);
    return -(p*Math.log2(p)+(1-p)*Math.log2(1-p));
  }

  function reliability(input={}){
    const calibration=clamp(n(input.calibration,50),0,100);
    const agreement=clamp(n(input.agreement,50),0,100);
    const scenarioRobustness=clamp(n(input.scenarioRobustness,50),0,100);
    const dataTrust=clamp(n(input.dataTrust,50),0,100);
    const regimeStability=clamp(n(input.regimeStability,50),0,100);
    return clamp(.28*calibration+.22*agreement+.20*scenarioRobustness+
      .18*dataTrust+.12*regimeStability,0,100);
  }

  function score(input={}){
    const p=clamp(n(input.probability,.5),0,1);
    const u=entropy(p)*100;
    const rel=reliability(input);
    const modelDisagreement=clamp(n(input.modelDisagreement,50),0,100);
    const scenarioDispersion=clamp(n(input.scenarioDispersion,50),0,100);
    const uncertainty=clamp(.35*u+.25*modelDisagreement+.25*scenarioDispersion+
      .15*(100-rel),0,100);
    const risk=clamp(n(input.riskScore,50),0,100);
    const decisionStrength=clamp(Math.abs(p-.5)*200,0,100);
    return {probability:p,reliability:rel,uncertainty,risk,decisionStrength,
      confidence:clamp((rel*.55)+(decisionStrength*.25)+(100-uncertainty)*.20,0,100)};
  }

  function calibratedProbability(input={}){
    const p=clamp(n(input.rawProbability,.5),0,1);
    const brier=clamp(n(input.brier,0.25),0,1);
    const reliabilityPenalty=clamp(n(input.reliabilityPenalty,0),0,1);
    const shrink=clamp(.20+brier*.80+reliabilityPenalty*.25,.20,.90);
    return .5+(p-.5)*(1-shrink);
  }

  function gate(input={}){
    const s=score(input);
    let decision=String(input.direction||"WAIT").toUpperCase();
    if(s.uncertainty>=70 || s.reliability<50) decision="WAIT";
    if(s.risk>=85 || input.dataBlocked===true) decision="NO-TRADE";
    return {...s,decision};
  }

  global.UncertaintyCalibrationV530000={entropy,reliability,score,calibratedProbability,gate};
})(typeof globalThis!=="undefined"?globalThis:window);
