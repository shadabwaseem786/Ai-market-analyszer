/*
 V210000 ADAPTIVE ONLINE LEARNING + REGIME SWITCHING
 Controlled model adaptation. No autonomous production promotion.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function regime(features={}){
   const vol=n(features.volatility),trend=n(features.trend),breadth=n(features.breadth);
   if(vol>=75)return {name:"HIGH_VOL",score:vol};
   if(trend>=35&&breadth>=35)return {name:"TREND_UP",score:(trend+breadth)/2};
   if(trend<=-35&&breadth<=-35)return {name:"TREND_DOWN",score:(Math.abs(trend)+Math.abs(breadth))/2};
   return {name:"RANGE",score:50};
 }
 function exponentiallyWeighted(errors=[],halfLife=20){
   let weighted=0,total=0;
   errors.forEach((e,i)=>{const w=Math.pow(.5,i/Math.max(1,n(halfLife)));weighted+=n(e)*w;total+=w});
   return total?weighted/total:0;
 }
 function modelMetrics(predictions=[]){
   if(!predictions.length)return {n:0,accuracy:null,brier:null};
   let correct=0,brier=0;
   predictions.forEach(x=>{
     const p=clamp(n(x.probability,.5),0,1),a=n(x.actual,0);
     correct+=((p>=.5)===(a>=.5))?1:0;brier+=(p-a)*(p-a);
   });
   return {n:predictions.length,accuracy:correct/predictions.length,brier:brier/predictions.length};
 }
 function rankModels(models=[],metric="brier"){
   return models.slice().sort((a,b)=>n(a.metrics?.[metric],Infinity)-n(b.metrics?.[metric],Infinity));
 }
 function championChallenger(champion,challenger,policy={}){
   const minN=Math.max(30,n(policy.minSamples,100));
   if(n(challenger?.metrics?.n)<minN)return {winner:"CHAMPION",promote:false,reason:"INSUFFICIENT_SAMPLE"};
   const cb=n(champion?.metrics?.brier,1),xb=n(challenger?.metrics?.brier,1);
   const improvement=cb?((cb-xb)/cb)*100:0;
   const required=n(policy.requiredImprovement,5);
   const pass=improvement>=required&&n(challenger?.metrics?.accuracy)>=n(champion?.metrics?.accuracy)-.01;
   return {winner:pass?"CHALLENGER":"CHAMPION",promote:pass,improvement,reason:pass?"VALIDATED_IMPROVEMENT":"NO_SUFFICIENT_IMPROVEMENT"};
 }
 function adaptiveWeight(base,regimeName,history={}){
   const r=history[regimeName]||{};
   const quality=clamp(n(r.quality,50),0,100);
   return clamp(n(base,1)*(.5+quality/100),.1,2);
 }
 function onlineUpdate(state={},outcome={}){
   const err=Math.abs(n(outcome.prediction,.5)-n(outcome.actual,0));
   const ew=exponentiallyWeighted([err,...(state.recentErrors||[])],n(state.halfLife,20));
   return {...state,recentErrors:[err,...(state.recentErrors||[])].slice(0,100),rollingError:ew,
     status:ew>.35?"DEGRADED":"HEALTHY"};
 }
 function evaluatePromotion(champion,challenger,policy={}){ return championChallenger(champion,challenger,policy); }
 global.AdaptiveLearningV210000={regime,exponentiallyWeighted,modelMetrics,rankModels,championChallenger,adaptiveWeight,onlineUpdate,evaluatePromotion};
})(typeof globalThis!=="undefined"?globalThis:window);
