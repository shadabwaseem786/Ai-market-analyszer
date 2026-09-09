/*
 V130000 CAUSAL + COUNTERFACTUAL + RED TEAM + EXPLAINABILITY
 Decision-support governance layer. No automatic order execution.
*/
(function(global){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

 function attribution(signals=[]){
   const a=signals.map(s=>({name:s.name||"signal",impact:n(s.impact),
     confidence:clamp(n(s.confidence,50),0,100)}));
   const total=a.reduce((s,x)=>s+Math.abs(x.impact),0)||1;
   return a.map(x=>({...x,share:Math.abs(x.impact)/total*100}))
     .sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact));
 }

 function counterfactual(base={},changes=[]){
   let score=n(base.score);
   const scenarios=changes.map(c=>{
     const delta=n(c.delta);
     const next=clamp(score+delta,-100,100);
     return {assumption:c.assumption||"UNKNOWN",delta,next,
       flips:Math.sign(score)!==Math.sign(next)};
   });
   return {baseScore:score,scenarios};
 }

 function invalidation(base={},levels={}){
   const score=n(base.score);
   const threshold=n(base.threshold,55);
   const direction=score>=0?1:-1;
   const margin=Math.max(0,Math.abs(score)-threshold);
   return {direction,threshold,margin,
     invalidated:Math.abs(score)<threshold,
     keyRisk:levels.keyRisk||"UNKNOWN"};
 }

 function redTeam(input={}){
   const tests=[
    ["data_stale",input.dataStale===true],
    ["catalyst_unverified",input.catalystVerified===false],
    ["cross_market_conflict",input.crossMarketConflict===true],
    ["option_chain_conflict",input.optionConflict===true],
    ["regime_uncertain",input.regimeUncertain===true],
    ["model_drift",input.modelDrift===true],
    ["liquidity_risk",n(input.liquidityRisk)>=70]
   ];
   const failed=tests.filter(x=>x[1]).map(x=>x[0]);
   return {failed,attackCount:failed.length,
     verdict:failed.length>=3?"REJECT":failed.length? "CAUTION":"PASS"};
 }

 function explain(input={}){
   const top=attribution(input.signals||[]);
   const cf=counterfactual(input.base||{},input.counterfactuals||[]);
   const inv=invalidation(input.base||{},input.levels||{});
   const rt=redTeam(input);
   const decision=rt.verdict==="REJECT"?"NO-TRADE":input.decision||"WAIT";
   return {topAttributions:top,counterfactuals:cf,invalidation:inv,redTeam:rt,
     decision,explanation:top.slice(0,3).map(x=>x.name)};
 }

 global.CausalRedTeamV130000={attribution,counterfactual,invalidation,redTeam,explain};
})(typeof globalThis!=="undefined"?globalThis:window);
