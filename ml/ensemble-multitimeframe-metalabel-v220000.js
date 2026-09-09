/*
 V220000 ENSEMBLE + MULTI-TIMEFRAME SYNCHRONIZATION + META-LABELING
 Controlled decision-support layer. No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function timeframeFusion(frames=[]){
   const valid=frames.filter(x=>x&&Number.isFinite(Number(x.score)));
   if(!valid.length)return {score:0,agreement:0,direction:"NEUTRAL"};
   let s=0,w=0;
   valid.forEach(x=>{const wt=Math.max(.1,n(x.weight,1));s+=n(x.score)*wt;w+=wt});
   const score=s/w;
   const signs=valid.filter(x=>Math.sign(n(x.score))===Math.sign(score)).length;
   return {score,agreement:signs/valid.length,direction:score>=20?"BULLISH":score<=-20?"BEARISH":"NEUTRAL"};
 }
 function ensemble(models=[]){
   const v=models.filter(x=>Number.isFinite(Number(x.probability)));
   if(!v.length)return {probability:.5,disagreement:1};
   const p=v.reduce((s,x)=>s+n(x.probability,.5)*Math.max(.1,n(x.weight,1)),0)/
     v.reduce((s,x)=>s+Math.max(.1,n(x.weight,1)),0);
   const dispersion=v.reduce((s,x)=>s+Math.abs(n(x.probability,.5)-p),0)/v.length;
   return {probability:clamp(p,0,1),disagreement:clamp(dispersion*2,0,1)};
 }
 function metaLabel(x={}){
   const raw=clamp(n(x.probability,.5),0,1);
   const agreement=clamp(n(x.timeframeAgreement,.5),0,1);
   const ensembleAgreement=1-clamp(n(x.ensembleDisagreement,0),0,1);
   const catalyst=clamp(n(x.catalystConfirmation,.5),0,1);
   const regime=clamp(n(x.regimeConfirmation,.5),0,1);
   const quality=.30*agreement+.25*ensembleAgreement+.25*catalyst+.20*regime;
   const calibrated=.5+(raw-.5)*(0.65+0.35*quality);
   return {quality,probability:clamp(calibrated,0,1),
     label:quality>=.7?"HIGH_QUALITY":quality>=.5?"VALIDATED":"LOW_QUALITY"};
 }
 function synchronize(input={}){
   const tf=timeframeFusion(input.timeframes||[]);
   const en=ensemble(input.models||[]);
   const meta=metaLabel({...input,timeframeAgreement:tf.agreement,ensembleDisagreement:en.disagreement});
   const p=meta.probability;
   let decision=p>=.6?"BUY":p<=.4?"SELL":"WAIT";
   if(meta.label==="LOW_QUALITY")decision="WAIT";
   return {timeframes:tf,ensemble:en,meta,decision};
 }
 global.EnsembleV220000={timeframeFusion,ensemble,metaLabel,synchronize};
})(typeof globalThis!=="undefined"?globalThis:window);
