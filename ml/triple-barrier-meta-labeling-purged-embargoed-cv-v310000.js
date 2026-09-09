/*
 V310000 TRIPLE-BARRIER + META-LABELING + PURGED/EMBARGOED CV
 Validation-aware target construction. No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function tripleBarrier(events=[],prices=[],opts={}){
   const pt=Math.abs(n(opts.profitTakePct,.02)), sl=Math.abs(n(opts.stopLossPct,.01));
   const horizon=Math.max(1,n(opts.horizonBars,10));
   const out=[];
   events.forEach((e,idx)=>{
     const entry=n(e.price,prices[idx]);
     if(!entry)return;
     let label=0,exitIdx=Math.min(prices.length-1,idx+horizon),exitPrice=n(prices[exitIdx],entry),barrier="TIME";
     for(let j=idx+1;j<=Math.min(prices.length-1,idx+horizon);j++){
       const r=n(prices[j],entry)/entry-1;
       if(r>=pt){label=1;exitIdx=j;exitPrice=prices[j];barrier="PROFIT";break}
       if(r<=-sl){label=-1;exitIdx=j;exitPrice=prices[j];barrier="STOP";break}
     }
     out.push({...e,entryPrice:entry,exitIndex:exitIdx,exitPrice,returnPct:(exitPrice/entry-1)*100,label,barrier,
       t0:e.time||null,t1:e.t1||null});
   });
   return out;
 }
 function metaLabel(primarySignal, realizedLabel){
   const primary=Number(primarySignal)>0, valid=Number(realizedLabel)>0;
   return primary===valid?1:0;
 }
 function labelIntervals(labels=[]){
   return labels.map((x,i)=>({i,start:Date.parse(x.t0),end:Date.parse(x.t1)||Date.parse(x.time)}));
 }
 function purgedEmbargoFolds(labels=[],opts={}){
   const k=Math.max(2,n(opts.folds,5)), embargoMs=Math.max(0,n(opts.embargoMs,0));
   const ints=labelIntervals(labels).filter(x=>Number.isFinite(x.start));
   const sorted=ints.sort((a,b)=>a.start-b.start), size=Math.ceil(sorted.length/k), folds=[];
   for(let f=0;f<k;f++){
     const test=sorted.slice(f*size,Math.min(sorted.length,(f+1)*size));
     if(!test.length)continue;
     const testStart=test[0].start,testEnd=Math.max(...test.map(x=>x.end||x.start));
     const train=sorted.filter(x=>x.i!==undefined && !test.some(t=>t.i===x.i) &&
       !((x.start<=testEnd)&&(x.end>=testStart)) && x.start>testEnd+embargoMs);
     folds.push({fold:f+1,train:train.map(x=>x.i),test:test.map(x=>x.i),
       purgeBoundary:[testStart,testEnd],embargoMs});
   }
   return folds;
 }
 function sampleUniqueness(labels=[]){
   const ints=labelIntervals(labels), counts=ints.map(x=>ints.filter(y=>y.start<=x.end&&y.end>=x.start).length);
   return counts.map(c=>1/Math.max(1,c));
 }
 function overfitDefense(trials=[],observedSharpe=0){
   const s=trials.map(n).filter(Number.isFinite).sort((a,b)=>a-b);
   if(!s.length)return {trials:0,pbo:null,deflatedSharpe:null};
   const better=s.filter(x=>x>=observedSharpe).length;
   const pbo=better/s.length;
   const mean=s.reduce((a,b)=>a+b,0)/s.length;
   const sd=Math.sqrt(s.reduce((a,x)=>a+(x-mean)**2,0)/Math.max(1,s.length-1));
   const z=sd? (observedSharpe-mean)/sd : 0;
   return {trials:s.length,pbo,trialMean:mean,trialSd:sd,observedSharpe,standardizedSharpe:z,
     status:pbo>.5?"HIGH_OVERFIT_RISK":pbo>.2?"ELEVATED":"LOWER"};
 }
 function metaGate(x={}){
   const labelOk=n(x.metaProbability,.5)>=n(x.minMetaProbability,.6);
   const cvOk=Boolean(x.purgedCvPassed);
   const leakOk=Boolean(x.leakageFirewallPassed);
   const overfit=overfitDefense(x.trialSharpes||[],n(x.observedSharpe));
   const veto=!labelOk||!cvOk||!leakOk||overfit.status==="HIGH_OVERFIT_RISK";
   return {labelOk,cvOk,leakOk,overfit,veto,decision:veto?"REJECT_OR_RESEARCH":"META-PASS"};
 }
 global.LabelingValidationV310000={tripleBarrier,metaLabel,labelIntervals,purgedEmbargoFolds,sampleUniqueness,overfitDefense,metaGate};
})(typeof globalThis!=="undefined"?globalThis:window);
