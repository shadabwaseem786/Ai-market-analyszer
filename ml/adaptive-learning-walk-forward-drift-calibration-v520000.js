/*
 V520000 ADAPTIVE LEARNING + VALIDATION
 Walk-forward/out-of-sample validation, drift monitoring, probability calibration,
 champion/challenger governance, paper-trading feedback and retraining triggers.
 No autonomous promotion or live trading.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;

 function splitWalkForward(rows=[],trainSize=100,testSize=25,step=25){const out=[];for(let start=0;start+trainSize+testSize<=rows.length;start+=step)out.push({train:rows.slice(start,start+trainSize),test:rows.slice(start+trainSize,start+trainSize+testSize),start});return out}
 function classificationMetrics(pred=[],actual=[],threshold=.5){let tp=0,tn=0,fp=0,fn=0;for(let i=0;i<Math.min(pred.length,actual.length);i++){const p=n(pred[i])>=threshold?1:0,a=n(actual[i])?1:0;if(p&&a)tp++;else if(!p&&!a)tn++;else if(p&&!a)fp++;else fn++}const acc=(tp+tn)/(tp+tn+fp+fn||1),prec=tp/(tp+fp||1),rec=tp/(tp+fn||1),f1=2*prec*rec/(prec+rec||1);return {accuracy:acc,precision:prec,recall:rec,f1,tp,tn,fp,fn}}
 function regressionMetrics(pred=[],actual=[]){const e=pred.map((p,i)=>n(p)-n(actual[i])).slice(0,Math.min(pred.length,actual.length));const mae=mean(e.map(Math.abs)),rmse=Math.sqrt(mean(e.map(x=>x*x)));return {mae,rmse,bias:mean(e)}}
 function brierScore(prob=[],actual=[]){const e=prob.map((p,i)=>Math.pow(clamp(n(p),0,1)-n(actual[i]),2));return mean(e)}
 function calibrationBuckets(prob=[],actual=[],bins=10){const out=[];for(let b=0;b<bins;b++){const lo=b/bins,hi=(b+1)/bins,ix=[];for(let i=0;i<Math.min(prob.length,actual.length);i++)if((prob[i]>=lo&&prob[i]<hi)||(b===bins-1&&prob[i]===hi))ix.push(i);out.push({bin:b,meanPred:mean(ix.map(i=>prob[i])),empirical:mean(ix.map(i=>actual[i])),count:ix.length})}return out}
 function expectedCalibrationError(prob=[],actual=[],bins=10){return mean(calibrationBuckets(prob,actual,bins).filter(x=>x.count).map(x=>Math.abs(x.meanPred-x.empirical)))}
 function driftScore(reference=[],current=[]){const a=mean(reference),b=mean(current),sd=Math.sqrt(mean(reference.map(x=>Math.pow(n(x)-a,2))))||1;return clamp(Math.abs(b-a)/sd/3,0,1)}
 function featureDrift(reference={},current={}){const keys=new Set([...Object.keys(reference),...Object.keys(current)]),out={};for(const k of keys)out[k]=driftScore(reference[k]||[],current[k]||[]);return out}
 function conceptDrift(oldMetrics={},newMetrics={},maxDrop=.1){const drop=n(oldMetrics.f1)-n(newMetrics.f1);return {drop,detected:drop>maxDrop}}
 function modelScore(m={}){const returnScore=n(m.expectancy),risk=1-clamp(n(m.maxDrawdown),0,1),cal=1-clamp(n(m.ece),0,1),rob=clamp(n(m.oosScore,.5),0,1);return clamp(.35*clamp(.5+returnScore,.0,1)+.25*risk+.2*cal+.2*rob,0,1)}
 function championChallenger(champion={},challenger={},minImprovement=.05){const c=modelScore(champion),q=modelScore(challenger),delta=q-c;return {championScore:c,challengerScore:q,delta,challengerWins:delta>=minImprovement,recommendation:delta>=minImprovement?"PROMOTE_AFTER_REVIEW":"KEEP_CHAMPION"}}
 function retrainTrigger(ctx={}){const reasons=[];if(n(ctx.driftScore)>n(ctx.maxDrift,.65))reasons.push("FEATURE_DRIFT");if(ctx.conceptDrift)reasons.push("CONCEPT_DRIFT");if(n(ctx.ece)>.15)reasons.push("CALIBRATION_DEGRADATION");if(n(ctx.oosScore)<n(ctx.minOosScore,.5))reasons.push("OOS_DEGRADATION");return {trigger:reasons.length>0,reasons}}
 function paperTradeStats(trades=[]){const r=trades.map(t=>n(t.pnl)),wins=r.filter(x=>x>0),loss=r.filter(x=>x<0),grossWin=wins.reduce((a,b)=>a+b,0),grossLoss=Math.abs(loss.reduce((a,b)=>a+b,0));let peak=0,eq=0,maxDD=0;for(const x of r){eq+=x;peak=Math.max(peak,eq);maxDD=Math.max(maxDD,peak-eq)}return {trades:r.length,winRate:r.length?wins.length/r.length:0,expectancy:mean(r),grossProfit:grossWin,grossLoss:grossLoss,profitFactor:grossLoss?grossWin/grossLoss:null,maxDrawdown:maxDD}}
 function safePromotion(champion={},challenger={},governance={}){const cc=championChallenger(champion,challenger,n(governance.minImprovement,.05));const gates=[governance.requireOos!==false?challenger.oosPass!==false:true,governance.requirePaper!==false?challenger.paperPass!==false:true,governance.requireDriftCheck!==false?challenger.driftPass!==false:true];return {...cc,gates,eligible:cc.challengerWins&&gates.every(Boolean),requiresHumanApproval:true}}
 global.AdaptiveLearningV520000={splitWalkForward,classificationMetrics,regressionMetrics,brierScore,calibrationBuckets,expectedCalibrationError,driftScore,featureDrift,conceptDrift,modelScore,championChallenger,retrainTrigger,paperTradeStats,safePromotion};
})(typeof globalThis!=="undefined"?globalThis:window);
