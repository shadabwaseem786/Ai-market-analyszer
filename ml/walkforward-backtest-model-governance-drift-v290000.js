/*
 V290000 ONLINE BACKTESTING + WALK-FORWARD VALIDATION + MODEL GOVERNANCE
 Scientific model-validation layer. No automatic trading.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function confusion(actual=[],predicted=[]){
   let tp=0,tn=0,fp=0,fn=0;
   for(let i=0;i<Math.min(actual.length,predicted.length);i++){
     const a=Number(actual[i])>0,p=Number(predicted[i])>0;
     if(a&&p)tp++; else if(!a&&!p)tn++; else if(p)fp++; else fn++;
   }
   const precision=tp/(tp+fp||1), recall=tp/(tp+fn||1);
   return {tp,tn,fp,fn,precision,recall,f1:2*precision*recall/(precision+recall||1),
     accuracy:(tp+tn)/(tp+tn+fp+fn||1)};
 }
 function walkForward(data=[],opts={}){
   const train=Math.max(1,n(opts.train,100)),test=Math.max(1,n(opts.test,25)),step=Math.max(1,n(opts.step,test));
   const folds=[];
   for(let start=0;start+train+test<=data.length;start+=step){
     folds.push({trainStart:start,trainEnd:start+train,testStart:start+train,testEnd:start+train+test});
   }
   return {folds,foldCount:folds.length,method:"ROLLING_WALK_FORWARD"};
 }
 function drift(reference=[],current=[]){
   const mean=a=>a.length?a.reduce((x,y)=>x+n(y),0)/a.length:0;
   const variance=a=>{const m=mean(a);return a.length?a.reduce((s,x)=>s+(n(x)-m)**2,0)/a.length:0};
   const m1=mean(reference),m2=mean(current),v1=Math.sqrt(variance(reference)),v2=Math.sqrt(variance(current));
   const meanShift=Math.abs(m2-m1)/(Math.abs(m1)+Math.abs(m2)+1e-9);
   const volShift=Math.abs(v2-v1)/(v1+v2+1e-9);
   const score=clamp((meanShift+volShift)*100,0,100);
   return {meanReference:m1,meanCurrent:m2,volReference:v1,volCurrent:v2,score,
     state:score>=70?"SEVERE":score>=40?"ELEVATED":"STABLE"};
 }
 function calibration(predicted=[],actual=[]){
   const bins=Array.from({length:10},()=>({n:0,p:0,y:0}));
   for(let i=0;i<Math.min(predicted.length,actual.length);i++){
     const p=clamp(n(predicted[i],.5),0,1), b=Math.min(9,Math.floor(p*10));
     bins[b].n++; bins[b].p+=p; bins[b].y+=Number(actual[i])>0?1:0;
   }
   let ece=0,total=actual.length;
   bins.forEach(b=>{if(b.n){ece+=(b.n/Math.max(1,total))*Math.abs(b.p/b.n-b.y/b.n)}});
   return {ece,bins};
 }
 function championChallenger(champion={},challenger={},threshold=.02){
   const c=n(champion.score),h=n(challenger.score);
   const improvement=(h-c)/(Math.abs(c)+1e-9);
   return {championScore:c,challengerScore:h,improvement,
     challengerWins:improvement>=threshold,
     recommendation:improvement>=threshold?"PROMOTE_AFTER_GOVERNANCE":"KEEP_CHAMPION"};
 }
 function governance(x={}){
   const driftResult=drift(x.reference||[],x.current||[]);
   const cal=calibration(x.predicted||[],x.actual||[]);
   const cc=championChallenger(x.champion||{},x.challenger||{},n(x.promotionThreshold,.02));
   const veto=driftResult.state==="SEVERE" || cal.ece>n(x.maxECE,.15);
   return {drift:driftResult,calibration:cal,championChallenger:cc,
     veto,recommendation:veto?"FREEZE_OR_ROLLBACK":cc.recommendation};
 }
 global.GovernanceV290000={confusion,walkForward,drift,calibration,championChallenger,governance};
})(typeof globalThis!=="undefined"?globalThis:window);
