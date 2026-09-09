/*
 V440000 AI ENSEMBLE + MODEL GOVERNANCE
 Model diversity, calibration, disagreement, regime selection, drift detection,
 performance decay, dynamic weighting, explainability and safe self-learning gates.
 No autonomous model deployment/execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 const variance=a=>a.length>1?mean(a.map(x=>(n(x)-mean(a))**2)):0;

 function normalizeWeights(models=[]){const positive=models.map(m=>Math.max(0,n(m.weight,1)));const t=positive.reduce((a,b)=>a+b,0)||1;return models.map((m,i)=>({...m,weight:positive[i]/t}))}
 function ensemble(models=[],field="probability"){const ms=normalizeWeights(models);const p=ms.reduce((s,m)=>s+n(m[field],0)*n(m.weight,0),0);const disagreement=Math.sqrt(mean(ms.map(m=>(n(m[field],0)-p)**2)));return {probability:clamp(p,0,1),disagreement,models:ms}}
 function brier(predictions=[]){if(!predictions.length)return null;return mean(predictions.map(x=>(n(x.probability)-n(x.outcome))**2))}
 function calibrationGap(predictions=[],bins=10){if(!predictions.length)return {gap:null,bins:[]};const out=[];for(let i=0;i<bins;i++){const lo=i/bins,hi=(i+1)/bins,a=predictions.filter(x=>n(x.probability)>=lo&&n(x.probability)<(i===bins-1?1.000001:hi));if(a.length)out.push({lo,hi,count:a.length,pred:mean(a.map(x=>x.probability)),actual:mean(a.map(x=>x.outcome)),gap:Math.abs(mean(a.map(x=>x.probability))-mean(a.map(x=>x.outcome)))});}return {gap:out.length?mean(out.map(x=>x.gap)):0,bins:out}}
 function modelScore(m={}){return clamp(.35*n(m.recentAccuracy,.5)+.25*(1-n(m.brier,.25)*4)+.2*n(m.calibration,.5)+.2*n(m.stability,.5),0,1)}
 function championChallenger(champion={},challenger={}){const c=modelScore(champion),q=modelScore(challenger);return {championScore:c,challengerScore:q,winner:q>c+.03?"CHALLENGER":"CHAMPION",promotionGate:q>c+.03&&n(challenger.validationCount)>=n(challenger.minValidationCount,100)&&!challenger.driftDetected}}
 function driftBaseline(current=[],baseline=[],threshold=2){if(current.length<3||baseline.length<3)return {detected:false,z:null};const m=mean(baseline),sd=Math.sqrt(variance(baseline))||1,z=(mean(current)-m)/sd;return {detected:Math.abs(z)>=threshold,z}}
 function featureDrift(current=[],reference=[],threshold=2){return current.map((x,i)=>({feature:x.feature,drift:driftBaseline(x.values,reference[i]?.values||[],threshold)}))}
 function performanceDecay(recent=[],historical=[]){const r=mean(recent),h=mean(historical);return {recent:r,historical:h,decay:h-r,ratio:h?r/h:null}}
 function regimeModelSelect(models=[],regime){const eligible=models.filter(m=>!m.disabled&&(m.regimes||[]).includes(regime));return normalizeWeights(eligible.length?eligible:models.filter(m=>!m.disabled))}
 function dynamicWeights(models=[],regime){return normalizeWeights(models.map(m=>({...m,weight:modelScore(m)*(m.regime===regime?1.15:1)})))}
 function selfLearningGate(ctx={}){const pass=!ctx.dataDrift&&!ctx.labelLeakage&&!ctx.calibrationFailure&&!ctx.performanceDecay&&n(ctx.validationScore,.0)>=n(ctx.minValidationScore,.65)&&n(ctx.sampleSize)>=n(ctx.minSampleSize,500);return {pass,action:pass?"ALLOW_SHADOW_UPDATE":"BLOCK_UPDATE",reasons:[ctx.dataDrift&&"DATA_DRIFT",ctx.labelLeakage&&"LABEL_LEAKAGE",ctx.calibrationFailure&&"CALIBRATION_FAILURE",ctx.performanceDecay&&"PERFORMANCE_DECAY"].filter(Boolean)}}
 function explainability(features=[]){return features.slice().sort((a,b)=>Math.abs(n(b.contribution))-Math.abs(n(a.contribution))).map((x,i)=>({...x,rank:i+1,direction:n(x.contribution)>=0?"SUPPORTS":"OPPOSES"}))}
 global.AIEnsembleV440000={normalizeWeights,ensemble,brier,calibrationGap,modelScore,championChallenger,driftBaseline,featureDrift,performanceDecay,regimeModelSelect,dynamicWeights,selfLearningGate,explainability};
})(typeof globalThis!=="undefined"?globalThis:window);
