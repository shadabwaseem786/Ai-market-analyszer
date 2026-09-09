/*
 V490000 ADVERSARIAL AI + REGIME-SPECIFIC RED-TEAM ENGINE
 Tries to falsify bullish/bearish hypotheses before final decision.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function contradictionScore(c={}){
    const factors=[
      n(c.priceFlowConflict,0),
      n(c.oiPriceConflict,0),
      n(c.catalystConflict,0),
      n(c.regimeMismatch,0),
      n(c.liquidityTrap,0),
      n(c.falseBreakoutRisk,0),
      n(c.momentumExhaustion,0),
      n(c.correlationBreakdown,0),
      n(c.modelDisagreement,0),
      n(c.historicalAnalogFailure,0)
    ];
    const score=factors.reduce((a,b)=>a+b,0)/factors.length;
    return clamp(score,0,100);
  }

  function redTeam(input={}){
    const bull=clamp(n(input.bullCase,50),0,100);
    const bear=clamp(n(input.bearCase,50),0,100);
    const contradiction=contradictionScore(input);
    const asymmetry=Math.abs(bull-bear);
    const fragile=contradiction>=60 || asymmetry<10;
    const verdict=fragile?"FAIL_OR_WAIT":
      bull>bear+12?"BULL_CASE_SURVIVES":
      bear>bull+12?"BEAR_CASE_SURVIVES":"AMBIGUOUS";
    return {bullCase:bull,bearCase:bear,asymmetry,contradictionScore:contradiction,
      verdict,fragile};
  }

  function stressScenarios(input={}){
    const p=clamp(n(input.baseProbability,.5),0,1);
    const shock=n(input.shock,15)/100;
    return {
      base:p,
      adverseBull:clamp(p-shock,0,1),
      adverseBear:clamp(p+shock,0,1),
      volatilityShock:clamp(p-(shock*.75),0,1),
      liquidityShock:clamp(p-(shock*.9),0,1),
      catalystReversal:clamp(p-(shock*1.1),0,1)
    };
  }

  function gate(input={}){
    const r=redTeam(input);
    const stress=stressScenarios(input);
    let decision=String(input.direction||"WAIT").toUpperCase();
    if(r.fragile) decision="WAIT";
    if(r.contradictionScore>=80) decision="NO-TRADE";
    if(decision==="BUY" && stress.adverseBull<.50) decision="WAIT";
    if(decision==="SELL" && stress.adverseBear>.50) decision="WAIT";
    return {...r,stress,decision};
  }

  global.AdversarialRedTeamV490000={contradictionScore,redTeam,stressScenarios,gate};
})(typeof globalThis!=="undefined"?globalThis:window);
