/*
 V330000 CROSS-MARKET / INTERMARKET INTELLIGENCE
 Normalized relationships, confirmation/divergence, lead-lag hooks and catalyst propagation.
 Research/decision support only.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 const corr=(a,b)=>{let N=Math.min(a.length,b.length);if(N<3)return 0;let x=a.slice(-N),y=b.slice(-N),mx=mean(x),my=mean(y),num=0,dx=0,dy=0;
   for(let i=0;i<N;i++){let u=n(x[i])-mx,v=n(y[i])-my;num+=u*v;dx+=u*u;dy+=v*v}return dx&&dy?num/Math.sqrt(dx*dy):0};
 function zscore(values){const m=mean(values),s=Math.sqrt(mean(values.map(x=>(n(x)-m)**2)))||1;return n(values.at(-1)-m)/s}
 function matrix(series={}){const k=Object.keys(series),out={};k.forEach(a=>out[a]={});k.forEach(a=>k.forEach(b=>out[a][b]=corr(series[a]||[],series[b]||[])));return out}
 function confirmation(target={},signals={},threshold=.45){
   const votes=[];Object.entries(signals).forEach(([name,v])=>{const x=n(v);if(Math.abs(x)>=threshold)votes.push({name,signal:x>0?"BULLISH":"BEARISH",strength:Math.abs(x)})});
   const bull=votes.filter(x=>x.signal==="BULLISH").reduce((s,x)=>s+x.strength,0),bear=votes.filter(x=>x.signal==="BEARISH").reduce((s,x)=>s+x.strength,0);
   const total=bull+bear||1;return {votes,bullShare:bull/total,bearShare:bear/total,agreement:Math.abs(bull-bear)/total,
     state:Math.abs(bull-bear)/total>.5?(bull>bear?"CONFIRMED_BULLISH":"CONFIRMED_BEARISH"):"DIVERGENT"};
 }
 function leadLag(a=[],b=[],maxLag=10){let best={lag:0,corr:-Infinity};for(let lag=-maxLag;lag<=maxLag;lag++){let x,y;
   if(lag>=0){x=a.slice(0,-lag||undefined);y=b.slice(lag)}else{x=a.slice(-lag);y=b.slice(0,lag||undefined)}
   const c=corr(x,y);if(c>best.corr)best={lag,corr:c};}return best;
 }
 function catalystPropagation(catalyst={},relations={}){
   const affected=[];Object.entries(relations).forEach(([asset,weight])=>{const w=n(weight);if(Math.abs(w)>=.25)affected.push({asset,impact:w>0?"POSITIVE":"NEGATIVE",strength:Math.abs(w)*n(catalyst.intensity,1)})});
   return {catalyst:catalyst.name||"UNSPECIFIED",affected:affected.sort((a,b)=>b.strength-a.strength)};
 }
 function intermarketState(x={}){
   const confirm=confirmation(x.target||{},x.signals||{},n(x.threshold,.45));
   const div=confirm.state==="DIVERGENT";
   return {...confirm,action:div?"REDUCE_CONFIDENCE":"NORMAL",riskMultiplier:div?.7:1};
 }
 global.CrossMarketV330000={corr,zscore,matrix,confirmation,leadLag,catalystPropagation,intermarketState};
})(typeof globalThis!=="undefined"?globalThis:window);
