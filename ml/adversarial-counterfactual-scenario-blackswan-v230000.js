/*
 V230000 ADVERSARIAL AI + COUNTERFACTUAL SCENARIO ENGINE
 Bull/Base/Bear/Black-Swan scenario competition, fragility testing,
 thesis invalidation and risk veto. Decision support only.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function scenarioScore(s={}){
   const p=clamp(n(s.probability,.25),0,1);
   const impact=clamp(n(s.impact,50),0,100);
   const evidence=clamp(n(s.evidence,50),0,100);
   return p*(.55*impact+.45*evidence);
 }
 function rankScenarios(scenarios=[]){
   return scenarios.map(s=>({...s,score:scenarioScore(s)}))
     .sort((a,b)=>b.score-a.score);
 }
 function adversarial(thesis={},attacks=[]){
   const failures=attacks.map(a=>{
     const likelihood=clamp(n(a.likelihood,.3),0,1);
     const damage=clamp(n(a.damage,50),0,100);
     return {...a,risk:likelihood*damage};
   }).sort((a,b)=>b.risk-a.risk);
   const total=failures.reduce((s,a)=>s+a.risk,0);
   return {failures,fragility:clamp(total/Math.max(1,failures.length),0,100),
     strongestAttack:failures[0]||null,
     thesis:thesis.name||"PRIMARY_THESIS"};
 }
 function counterfactual(input={}){
   const base=clamp(n(input.baseProbability,.5),0,1);
   const shocks=(input.shocks||[]).map(s=>{
     const delta=clamp(n(s.delta,0),-1,1);
     return {...s,result:clamp(base+delta,0,1)};
   });
   return {baseProbability:base,shocks,
     worst:shocks.reduce((a,b)=>b.result<a.result?b:a,shocks[0]||{result:base}),
     best:shocks.reduce((a,b)=>b.result>a.result?b:a,shocks[0]||{result:base})};
 }
 function blackSwan(input={}){
   const exposure=clamp(n(input.exposure,50),0,100);
   const tail=clamp(n(input.tailLikelihood,1),0,100);
   const liquidity=clamp(n(input.liquidityStress,50),0,100);
   return {tailRisk:clamp(.45*tail+.35*exposure+.20*liquidity,0,100),
     action:tail>8||liquidity>80?"REDUCE_OR_AVOID":"MONITOR"};
 }
 function scenarioGate(input={}){
   const adv=adversarial(input.thesis,input.attacks);
   const cf=counterfactual(input);
   const bs=blackSwan(input.blackSwan||{});
   const veto=adv.fragility>=70||bs.tailRisk>=75||cf.worst.result<=.30;
   return {adversarial:adv,counterfactual:cf,blackSwan:bs,
     veto,decision:veto?"NO-TRADE":"SCENARIO-PASS"};
 }
 global.ScenarioEngineV230000={scenarioScore,rankScenarios,adversarial,counterfactual,blackSwan,scenarioGate};
})(typeof globalThis!=="undefined"?globalThis:window);
