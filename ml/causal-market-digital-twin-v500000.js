/*
 V500000 CAUSAL MARKET DIGITAL TWIN + SCENARIO ENGINE
 Scenario propagation and counterfactual stress framework.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function normalizeShock(s={}){
    return {
      id:s.id||s.name||"scenario",
      name:s.name||s.id||"scenario",
      probability:clamp(n(s.probability,.5),0,1),
      magnitude:n(s.magnitude,1),
      duration:n(s.duration,1),
      oil:n(s.oil,0), fx:n(s.fx,0), rates:n(s.rates,0),
      volatility:n(s.volatility,0), liquidity:n(s.liquidity,0),
      catalyst:n(s.catalyst,0)
    };
  }

  function propagate(shock={},graph=[]){
    const s=normalizeShock(shock);
    const nodes={};
    for(const edge of graph){
      const from=edge.from, to=edge.to;
      if(nodes[from]===undefined) nodes[from]=n(shock[from],0);
      const source=nodes[from];
      const gain=n(edge.weight,1);
      const lag=n(edge.lag,0);
      nodes[to]=(nodes[to]||0)+source*gain;
      if(!nodes[to+"_lag"]) nodes[to+"_lag"]=lag;
    }
    return {scenario:s,nodes};
  }

  function scenarioSet(shocks=[],graph=[]){
    return shocks.map(s=>({...propagate(s,graph),
      scenarioScore:clamp(n(s.probability,.5)*100,0,100)}))
      .sort((a,b)=>b.scenarioScore-a.scenarioScore);
  }

  function twinCompare(base={},scenarios=[]){
    return scenarios.map(s=>{
      const p=clamp(n(s.baseProbability,n(base.probability,.5)),0,1);
      const delta=n(s.probabilityShock,0);
      return {name:s.name||"scenario",baseProbability:p,
        stressedProbability:clamp(p+delta,0,1),
        delta:delta};
    });
  }

  function robustness(results=[]){
    if(!results.length)return {score:0,status:"NO_SCENARIOS"};
    const vals=results.map(x=>n(x.stressedProbability,.5));
    const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
    const dispersion=vals.reduce((a,b)=>a+Math.abs(b-mean),0)/vals.length;
    const score=clamp(100*(1-dispersion),0,100);
    return {score,status:score>=80?"ROBUST":score>=60?"SENSITIVE":"FRAGILE",
      meanStressedProbability:mean,dispersion};
  }

  function gate(input={}){
    const r=robustness(input.scenarios||[]);
    let decision=String(input.direction||"WAIT").toUpperCase();
    if(r.status==="FRAGILE") decision="NO-TRADE";
    else if(r.status==="SENSITIVE") decision="WAIT";
    return {...r,decision};
  }

  global.CausalMarketTwinV500000={normalizeShock,propagate,scenarioSet,twinCompare,robustness,gate};
})(typeof globalThis!=="undefined"?globalThis:window);
