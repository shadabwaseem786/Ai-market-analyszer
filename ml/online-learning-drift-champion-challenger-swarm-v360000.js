/*
 V360000 ONLINE LEARNING + DRIFT + CHAMPION/CHALLENGER SWARM
 Safe adaptive-learning governance. No silent promotion and no order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 const psi=(base,current,bins=10)=>{
   const eps=1e-6, N=Math.min(base.length,current.length); if(!N)return 0;
   const all=base.concat(current),mn=Math.min(...all),mx=Math.max(...all),span=mx-mn||1;
   const bc=Array(bins).fill(0),cc=Array(bins).fill(0);
   base.forEach(v=>bc[Math.min(bins-1,Math.max(0,Math.floor((n(v)-mn)/span*bins)))]++);
   current.forEach(v=>cc[Math.min(bins-1,Math.max(0,Math.floor((n(v)-mn)/span*bins)))]++);
   let s=0;for(let i=0;i<bins;i++){const p=Math.max(eps,bc[i]/base.length),q=Math.max(eps,cc[i]/current.length);s+=(q-p)*Math.log(q/p)}
   return s;
 };
 const ks=(a,b)=>{
   const x=a.slice().sort((u,v)=>u-v),y=b.slice().sort((u,v)=>u-v);let i=0,j=0,d=0;
   while(i<x.length&&j<y.length){const v=Math.min(x[i],y[j]);while(i<x.length&&x[i]<=v)i++;while(j<y.length&&y[j]<=v)j++;d=Math.max(d,Math.abs(i/x.length-j/y.length))}
   return d;
 };
 function drift(base,current,opts={}){
   const p=psi(base,current,n(opts.bins,10)), k=ks(base,current);
   const pw=n(opts.psiWarning,.1),pt=n(opts.psiTrigger,.25),kw=n(opts.ksTrigger,.15);
   return {psi:p,ks:k,psiState:p>=pt?"TRIGGER":p>=pw?"WARNING":"NORMAL",
     ksState:k>=kw?"TRIGGER":"NORMAL",drift:(p>=pt||k>=kw)?"DETECTED":"STABLE"};
 }
 function performance(y,p,window=100){
   const N=Math.min(y.length,p.length,window), a=y.slice(-N),b=p.slice(-N);
   if(!N)return {n:0,accuracy:null};
   return {n:N,accuracy:a.reduce((s,v,i)=>s+(Number(v)===Number(b[i])?1:0),0)/N};
 }
 function ewma(values,alpha=.1){
   if(!values.length)return null;let z=n(values[0]);
   for(let i=1;i<values.length;i++)z=alpha*n(values[i])+(1-alpha)*z;
   return z;
 }
 function driftScore(metrics={}){
   const d=clamp(n(metrics.dataDrift,0),0,1), c=clamp(n(metrics.conceptDrift,0),0,1);
   const perf=clamp(n(metrics.performanceDecay,0),0,1),reg=clamp(n(metrics.regimeShift,0),0,1);
   return clamp(.25*d+.35*c+.25*perf+.15*reg,0,1);
 }
 function challengerGate(champion={},challenger={},constraints={}){
   const minGain=n(constraints.minGain,.02), minSamples=n(constraints.minSamples,200);
   const gain=n(challenger.score)-n(champion.score);
   const stable=Boolean(challenger.stable), oos=Boolean(challenger.oosPassed), leakage=Boolean(challenger.leakagePassed);
   const enough=n(challenger.samples,0)>=minSamples;
   const pass=gain>=minGain&&stable&&oos&&leakage&&enough;
   return {gain,stable,oos,leakage,enough,pass,status:pass?"PROMOTION_ELIGIBLE":"HOLD"};
 }
 function shadowCompare(champion={},challengers=[]){
   return challengers.map(c=>({id:c.id,score:n(c.score),delta:n(c.score)-n(champion.score),
     shadow:true,decision:"LOG_ONLY"})).sort((a,b)=>b.score-a.score);
 }
 function rollbackGuard(state={}){
   const bad=Boolean(state.liveDegradation)||Boolean(state.dataIncident)||Boolean(state.regimeShock)||Boolean(state.governanceFail);
   return {rollbackRequired:bad,status:bad?"ROLLBACK_READY":"NORMAL",reason:bad?"SAFETY_TRIGGER":"NONE"};
 }
 function swarm(models=[],context={}){
   const sorted=models.slice().sort((a,b)=>n(b.score)-n(a.score));
   return {models:sorted.map((m,i)=>({...m,rank:i+1,role:i===0?"CHAMPION_CANDIDATE":"CHALLENGER"})),
     diversity:sorted.length>1?new Set(sorted.map(m=>m.family)).size/sorted.length:1,
     context};
 }
 function promotionProposal(champion,challenger,constraints={}){
   const gate=challengerGate(champion,challenger,constraints);
   return {...gate,action:gate.pass?"PROPOSE_REVIEW":"DO_NOT_PROMOTE",humanApprovalRequired:true};
 }
 global.AdaptiveGovernanceV360000={psi,ks,drift,performance,ewma,driftScore,challengerGate,shadowCompare,rollbackGuard,swarm,promotionProposal};
})(typeof globalThis!=="undefined"?globalThis:window);
