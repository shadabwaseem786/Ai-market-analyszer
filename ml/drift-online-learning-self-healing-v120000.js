/*
 V120000 DRIFT + ONLINE LEARNING + SELF-HEALING GOVERNANCE
 Detects data/feature/prediction/concept drift and governs recalibration,
 challenger activation, rollback and safe NO-TRADE states.
 No automatic order execution.
*/
(function(global){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 function distShift(base=[],live=[]){
   const a=base.filter(Number.isFinite),b=live.filter(Number.isFinite);
   if(!a.length||!b.length)return {score:0,status:"INSUFFICIENT_DATA"};
   const ma=mean(a),mb=mean(b),sa=Math.sqrt(mean(a.map(x=>(x-ma)**2)))||1;
   const z=Math.abs(mb-ma)/sa;
   const score=clamp(z*25,0,100);
   return {score,status:score>=75?"RED":score>=45?"AMBER":"GREEN",z};
 }
 function predictionDrift(base=[],live=[]){return distShift(base,live)}
 function performanceDrift(baseline={},current={}){
   const delta=n(baseline.accuracy)-n(current.accuracy);
   return {delta,score:clamp(delta*3,0,100),status:delta>=20?"RED":delta>=10?"AMBER":"GREEN"};
 }
 function governance(x={}){
   const feature=distShift(x.featureBaseline||[],x.featureLive||[]);
   const pred=distShift(x.predBaseline||[],x.predLive||[]);
   const perf=performanceDrift(x.baseline||{},x.current||{});
   const red=[feature,pred,perf].filter(v=>v.status==="RED").length;
   const amber=[feature,pred,perf].filter(v=>v.status==="AMBER").length;
   let action=red>=2?"PAUSE_AND_ROLLBACK":red===1?"ACTIVATE_CHALLENGER":amber>=2?"RECALIBRATE":"CONTINUE";
   return {feature,prediction:pred,performance:perf,action,
     safeToTrade:action==="CONTINUE"||action==="RECALIBRATE"};
 }
 function updatePolicy(x={}){
   const g=governance(x);
   return {governance:g,policy:g.action==="PAUSE_AND_ROLLBACK"?"ROLLBACK":
     g.action==="ACTIVATE_CHALLENGER"?"CHALLENGER":g.action==="RECALIBRATE"?"RECALIBRATE":"CHAMPION"};
 }
 global.DriftGovernanceV120000={distShift,performanceDrift,governance,updatePolicy};
})(typeof globalThis!=="undefined"?globalThis:window);
