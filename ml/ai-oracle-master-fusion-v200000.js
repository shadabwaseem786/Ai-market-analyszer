/*
 V200000 AI ORACLE / MASTER FUSION
 Hierarchical evidence fusion + calibration + veto governance.
 This is decision support, not a guarantee of future returns.
 No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function normalize(v){ return clamp((n(v)+100)/200,0,1); }
 function weightedFusion(signals=[]){
   let w=0,s=0;
   signals.forEach(x=>{const wt=Math.max(0,n(x.weight,1));w+=wt;s+=normalize(x.score)*wt});
   const p=w?s/w:.5;
   return {probability:p,score:(p*2-1)*100,coverage:w};
 }
 function conflict(signals=[]){
   const active=signals.filter(x=>Math.abs(n(x.score))>=20);
   const bull=active.filter(x=>n(x.score)>0).length;
   const bear=active.filter(x=>n(x.score)<0).length;
   return {active:active.length,bull,bear,level:(bull&&bear)?"HIGH":"LOW"};
 }
 function calibrate(raw,temperature=1){
   const p=clamp(n(raw,.5),.0001,.9999);
   const t=Math.max(.05,n(temperature,1));
   const logit=Math.log(p/(1-p))/t;
   return 1/(1+Math.exp(-logit));
 }
 function brier(outcomes=[]){
   if(!outcomes.length)return null;
   return outcomes.reduce((s,x)=>s+Math.pow(n(x.prediction,.5)-n(x.actual,0),2),0)/outcomes.length;
 }
 function governance(input={}){
   const reasons=[];
   if(input.dataLive===false)reasons.push("DATA_NOT_LIVE");
   if(input.redTeam==="REJECT")reasons.push("RED_TEAM_REJECT");
   if(input.drift==="FAIL")reasons.push("MODEL_DRIFT");
   if(input.calibration==="FAIL")reasons.push("CALIBRATION_FAIL");
   if(n(input.confidence,100)<n(input.minConfidence,60))reasons.push("LOW_CONFIDENCE");
   if(n(input.conflicts,0)>=2)reasons.push("SIGNAL_CONFLICT");
   return {pass:reasons.length===0,reasons};
 }
 function oracle(input={}){
   const signals=input.signals||[];
   const fused=weightedFusion(signals);
   const conf=conflict(signals);
   const calibrated=calibrate(fused.probability,n(input.temperature,1));
   const gov=governance({...input,conflicts:conf.active});
   let decision=calibrated>=.6?"BUY":calibrated<=.4?"SELL":"WAIT";
   if(!gov.pass)decision="NO-TRADE";
   return {raw:fused.probability,probability:calibrated,score:(calibrated*2-1)*100,
     confidence:clamp(n(input.confidence,70)*(1-conf.active*.12),0,100),
     conflict:conf,governance:gov,decision};
 }
 global.AIOracleV200000={weightedFusion,conflict,calibrate,brier,governance,oracle};
})(typeof globalThis!=="undefined"?globalThis:window);
