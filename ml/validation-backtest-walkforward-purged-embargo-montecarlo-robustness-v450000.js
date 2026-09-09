/*
 V450000 VALIDATION & ROBUSTNESS ENGINE
 Point-in-time backtesting primitives, purged/embargoed splits, walk-forward windows,
 transaction costs/slippage, performance metrics, Monte-Carlo trade paths and overfit gates.
 No broker execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 const sum=a=>a.reduce((s,x)=>s+n(x),0);
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function purgedEmbargoSplit(samples=[],trainRatio=.7,purge=5,embargo=5){
   const cut=Math.floor(samples.length*trainRatio),train=samples.slice(0,Math.max(0,cut-purge)),test=samples.slice(cut+embargo);
   return {train,test,cut,purge,embargo};
 }
 function walkForward(samples=[],trainSize=500,testSize=100,step=100){
   const windows=[];for(let s=0;s+trainSize+testSize<=samples.length;s+=step)windows.push({train:samples.slice(s,s+trainSize),test:samples.slice(s+trainSize,s+trainSize+testSize),start:s});
   return windows;
 }
 function costAdjustedReturn(grossPct,turnoverPct=0,feePct=.01,slippagePct=.02){return n(grossPct)-n(turnoverPct)*(n(feePct)+n(slippagePct))}
 function equity(returns=[],initial=1){let e=n(initial,1),peak=e,maxDD=0,curve=[];for(const r of returns){e*=1+n(r)/100;peak=Math.max(peak,e);maxDD=Math.max(maxDD,(peak-e)/peak);curve.push(e)}return {final:e,returnPct:(e/n(initial,1)-1)*100,maxDrawdownPct:maxDD*100,curve}}
 function sharpe(returns=[],rf=0){if(returns.length<2)return null;const ex=returns.map(x=>n(x)-n(rf)),m=mean(ex),sd=Math.sqrt(mean(ex.map(x=>(x-m)**2)));return sd?m/sd*Math.sqrt(252):null}
 function sortino(returns=[],rf=0){const ex=returns.map(x=>n(x)-n(rf)),m=mean(ex),down=ex.filter(x=>x<0);const dd=Math.sqrt(mean(down.map(x=>x*x)))||0;return dd?m/dd*Math.sqrt(252):null}
 function profitFactor(returns=[]){const gains=sum(returns.filter(x=>n(x)>0)),loss=-sum(returns.filter(x=>n(x)<0));return loss?gains/loss:null}
 function expectancy(returns=[]){return mean(returns)}
 function hitRate(returns=[]){return returns.length?returns.filter(x=>n(x)>0).length/returns.length:null}
 function calmar(returns=[]){const e=equity(returns);return e.maxDrawdownPct?e.returnPct/e.maxDrawdownPct:null}
 function bootstrap(returns=[],iterations=1000){if(!returns.length)return null;const paths=[];for(let i=0;i<iterations;i++){let s=0;for(let j=0;j<returns.length;j++)s+=returns[Math.floor(Math.random()*returns.length)];paths.push(s)}paths.sort((a,b)=>a-b);const q=p=>paths[Math.floor(clamp(p,0,1)*(paths.length-1))];return {p05:q(.05),p50:q(.5),p95:q(.95),probPositive:paths.filter(x=>x>0).length/paths.length}}
 function maxDrawdownProbability(returns=[],thresholdPct=20,iterations=1000){if(!returns.length)return null;let hits=0;for(let i=0;i<iterations;i++){const r=[];for(let j=0;j<returns.length;j++)r.push(returns[Math.floor(Math.random()*returns.length)]);if(equity(r).maxDrawdownPct>=thresholdPct)hits++}return hits/iterations}
 function regimePerformance(records=[],regimeField="regime",returnField="returnPct"){const groups={};records.forEach(x=>{const k=x[regimeField]??"UNKNOWN";(groups[k]??=[]).push(n(x[returnField]))});return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,{count:v.length,mean:mean(v),hitRate:hitRate(v),profitFactor:profitFactor(v),maxDrawdownPct:equity(v).maxDrawdownPct}]))}
 function robustnessScore(metrics={}){return clamp(.2*clamp(n(metrics.sharpe)/2,0,1)+.2*clamp(n(metrics.sortino)/2,0,1)+.2*clamp(n(metrics.profitFactor)/2,0,1)+.15*clamp(n(metrics.hitRate),0,1)+.15*clamp(1-n(metrics.maxDrawdownPct)/50,0,1)+.1*clamp(n(metrics.outOfSampleStability,.5),0,1),0,1)}
 function overfitGate(ctx={}){const gap=Math.abs(n(ctx.trainScore)-n(ctx.testScore)),pass=gap<n(ctx.maxGap,.15)&&n(ctx.testScore)>=n(ctx.minTestScore,.55)&&n(ctx.walkForwardPassRate,.6)>=n(ctx.minWFPassRate,.6);return {pass,state:pass?"ROBUST":"OVERFIT_RISK",scoreGap:gap}}
 global.ValidationV450000={purgedEmbargoSplit,walkForward,costAdjustedReturn,equity,sharpe,sortino,profitFactor,expectancy,hitRate,calmar,bootstrap,maxDrawdownProbability,regimePerformance,robustnessScore,overfitGate};
})(typeof globalThis!=="undefined"?globalThis:window);
