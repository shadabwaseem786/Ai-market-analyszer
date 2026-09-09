/*
 V270000 AI RISK SENTINEL + EVENT SHOCK SIMULATOR
 Stress-tests an otherwise actionable setup against adverse scenarios.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function shockImpact(base={}, shock={}, sensitivities={}){
    const impacts={};
    for(const [factor,move] of Object.entries(shock||{})){
      const sens=sensitivities[factor]||{};
      for(const [target,coef] of Object.entries(sens)){
        impacts[target]=(impacts[target]||0)+n(move)*n(coef);
      }
    }
    return impacts;
  }

  function scenario(base, shock, sensitivities={}){
    const impacts=shockImpact(base,shock,sensitivities);
    const total=Object.values(impacts).reduce((s,x)=>s+x,0);
    return {shock,impacts,totalImpact:total};
  }

  function stressTest(input={}){
    const scenarios=input.scenarios||[];
    const baseScore=clamp(n(input.baseScore,50),0,100);
    const results=scenarios.map(s=>{
      const r=scenario(input.baseState||{},s.shock,s.sensitivities||input.sensitivities||{});
      const deterioration=Math.abs(r.totalImpact)*n(s.severityMultiplier,1);
      const stressed=clamp(baseScore-deterioration,0,100);
      return {...r,name:s.name||"Unnamed",stressedScore:stressed,
        survives:stressed>=n(s.minimumScore,55)};
    });
    const worst=results.reduce((a,b)=>!a||b.stressedScore<a.stressedScore?b:a,null);
    const survival=results.length?results.filter(x=>x.survives).length/results.length*100:100;
    return {results,worst,scenarioSurvival:survival};
  }

  function sentinel(input={}){
    const base=clamp(n(input.baseScore,50),0,100);
    const stress=stressTest(input);
    const risk=clamp(n(input.riskScore,50),0,100);
    const data=clamp(n(input.dataQuality,100),0,100);
    let status="GREEN";
    if(data<60 || risk>=85 || stress.scenarioSurvival<40) status="RED";
    else if(risk>=65 || stress.scenarioSurvival<70) status="AMBER";
    const action=status==="RED"?"NO-TRADE":status==="AMBER"?"WAIT":(input.direction==="SELL"?"SELL":"BUY");
    return {status,action,baseScore:base,riskScore:risk,dataQuality:data,...stress};
  }

  global.RiskSentinelV270000={shockImpact,scenario,stressTest,sentinel};
})(typeof globalThis!=="undefined"?globalThis:window);
