/*
 V430000 INSTITUTIONAL & SMART-MONEY FLOW INTELLIGENCE
 FII/DII flow, positioning, delivery, block/bulk activity, OI concentration,
 price-volume-OI divergence, accumulation/distribution proxies and flow regimes.
 Feed-agnostic; no execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const sum=a=>a.reduce((s,x)=>s+n(x),0);
 const mean=a=>a.length?sum(a)/a.length:0;

 function netFlow(buy,sell){return {buy:n(buy),sell:n(sell),net:n(buy)-n(sell),ratio:n(sell)?n(buy)/n(sell):null}}
 function flowZ(current,history=[]){if(history.length<3)return {z:null,state:"NO_HISTORY"};const m=mean(history),sd=Math.sqrt(mean(history.map(x=>(n(x)-m)**2)))||1,z=(n(current)-m)/sd;return {z,state:z>2?"STRONG_INFLOW":z<-2?"STRONG_OUTFLOW":"NORMAL"}}
 function positioning(longOI,shortOI){const l=n(longOI),s=n(shortOI),t=l+s||1;return {longOI:l,shortOI:s,longShare:l/t,shortShare:s/t,netBias:(l-s)/t}}
 function deliverySignal(deliveryPct,history=[]){const z=flowZ(deliveryPct,history);return {...z,deliveryPct:n(deliveryPct),state:n(deliveryPct)>n(mean(history),0)?"ACCUMULATION_BIAS":"NORMAL"}}
 function blockBulk(events=[]){return events.map(e=>({...e,value:n(e.price)*n(e.quantity),direction:n(e.buyQuantity??0)>n(e.sellQuantity??0)?"BUY":"SELL"}))}
 function oiConcentration(strikes=[]){const total=sum(strikes.map(x=>x.oi??0))||1;return strikes.map(x=>({...x,share:n(x.oi)/total})).sort((a,b)=>b.share-a.share)}
 function divergence(priceChangePct,volumeChangePct,oiChangePct){const p=n(priceChangePct),v=n(volumeChangePct),o=n(oiChangePct);return {priceVolume:(p>=0&&v<0)||(p<0&&v>0),priceOI:(p>=0&&o<0)||(p<0&&o>0),flowDivergence:(p>0&&o<0)||(p<0&&o>0)}}
 function accumulationDistribution(ctx={}){const score=clamp(.3*n(ctx.deliveryScore,.5)+.25*n(ctx.flowScore,.5)+.2*n(ctx.oiScore,.5)+.15*n(ctx.blockScore,.5)+.1*n(ctx.volumeScore,.5),0,1);return {score,state:score>=.67?"ACCUMULATION":score<=.4?"DISTRIBUTION":"MIXED"}}
 function flowRegime(ctx={}){const net=n(ctx.netFlow),z=n(ctx.flowZ),pos=n(ctx.positioning,0),score=clamp(.4*clamp((net+1)/2,0,1)+.35*clamp((z+3)/6,0,1)+.25*clamp((pos+1)/2,0,1),0,1);return {score,state:score>=.67?"RISK_ON_FLOW":score<=.4?"RISK_OFF_FLOW":"BALANCED_FLOW"}}
 function smartMoneyConfidence(ctx={}){const a=accumulationDistribution(ctx),r=flowRegime(ctx),d=divergence(ctx.priceChangePct,ctx.volumeChangePct,ctx.oiChangePct);let score=.55*a.score+.45*r.score;if(d.flowDivergence)score*=.75;return {score:clamp(score,0,1),accumulation:a,regime:r,divergence:d,confidence:score>=.7?"HIGH":score>=.5?"MEDIUM":"LOW"}}
 global.InstitutionalFlowV430000={netFlow,flowZ,positioning,deliverySignal,blockBulk,oiConcentration,divergence,accumulationDistribution,flowRegime,smartMoneyConfidence};
})(typeof globalThis!=="undefined"?globalThis:window);
