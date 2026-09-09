/*
 V390000 MARKET MICROSTRUCTURE + LIQUIDITY INTELLIGENCE 3.0
 Order-book imbalance, spread/depth, VWAP, volume anomalies, impact and execution quality.
 Uses supplied market/order-book observations; no broker connection and no order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const sum=a=>a.reduce((s,x)=>s+n(x),0);
 function obi(bids=[],asks=[]){
   const b=sum(bids.map(x=>x.size??x)),a=sum(asks.map(x=>x.size??x)),t=b+a||1;
   return {bidDepth:b,askDepth:a,imbalance:(b-a)/t};
 }
 function weightedMid(bid,ask){return (n(bid)+n(ask))/2}
 function spread(bid,ask,mid=weightedMid(bid,ask)){return {absolute:n(ask)-n(bid),pct:mid?((n(ask)-n(bid))/mid)*100:0}}
 function depth(levels=[],distancePct=.5){
   return sum(levels.filter(x=>Math.abs(n(x.priceDistancePct))<=distancePct).map(x=>x.size??x.quantity));
 }
 function vwap(trades=[]){
   const q=sum(trades.map(x=>x.volume??x.qty)); return q?sum(trades.map(x=>n(x.price)*n(x.volume??x.qty)))/q:null
 }
 function volumeZ(current,history=[]){
   const m=history.length?sum(history)/history.length:0;
   const sd=history.length>1?Math.sqrt(sum(history.map(x=>(n(x)-m)**2))/(history.length-1)):0;
   return sd?(n(current)-m)/sd:0
 }
 function impactEstimate(orderQty,depthValue,spreadPct=.1,elasticity=1){
   const d=Math.max(1,n(depthValue)); return Math.abs(n(orderQty))/d*elasticity + Math.abs(n(spreadPct))/100
 }
 function liquidityScore(ctx={}){
   const s=clamp(1-Math.abs(n(ctx.spreadPct))/n(ctx.maxSpreadPct,1),0,1);
   const d=clamp(n(ctx.depthRatio,1),0,1);
   const v=clamp(1-Math.abs(n(ctx.volumeImpact,0)),0,1);
   return clamp(.4*s+.4*d+.2*v,0,1)
 }
 function pressure(obiValue,tradeDelta=0,volumeZScore=0){
   return clamp(.55*n(obiValue)+.35*clamp(n(tradeDelta),-1,1)+.10*clamp(n(volumeZScore)/3,-1,1),-1,1)
 }
 function trapDetector(ctx={}){
   const signals=[];
   if(n(ctx.obi,0)>.45&&n(ctx.priceChangePct,0)<0)signals.push("BID_SUPPORT_NOT_HOLDING");
   if(n(ctx.obi,0)<-.45&&n(ctx.priceChangePct,0)>0)signals.push("ASK_PRESSURE_NOT_HOLDING");
   if(n(ctx.volumeZ,0)>3&&Math.abs(n(ctx.priceChangePct,0))<n(ctx.flatPricePct,.15))signals.push("ABSORPTION");
   if(n(ctx.spreadPct,0)>n(ctx.maxSpreadPct,1))signals.push("LIQUIDITY_STRESS");
   return {trapped:signals.length>0,signals};
 }
 function executionQuality(ctx={}){
   const liq=liquidityScore(ctx), impact=impactEstimate(ctx.orderQty,ctx.depthValue,ctx.spreadPct,ctx.elasticity);
   const pressureScore=pressure(ctx.obi,ctx.tradeDelta,ctx.volumeZ);
   const trap=trapDetector(ctx);
   const score=clamp(.45*liq+.25*(1-clamp(impact,0,1))+.2*(1-Math.abs(pressureScore)*.25)+.1*(trap.trapped?0:.1),0,1);
   return {score,liquidity:liq,impact,pressure:pressureScore,trap,status:score>=.7?"GOOD":score>=.45?"CAUTION":"POOR"};
 }
 function confirmation(signal,ctx={}){
   const e=executionQuality(ctx);
   if(e.status==="POOR"||e.trap.trapped)return {signal:"WAIT",confirmed:false,reason:e.trap.trapped?"LIQUIDITY_TRAP":"POOR_EXECUTION_QUALITY",execution:e};
   const aligned=(n(signal)>=0&&e.pressure>=0)||(n(signal)<0&&e.pressure<0);
   return {signal:aligned?(n(signal)>=0?"BUY":"SELL"):"WAIT",confirmed:aligned,reason:aligned?"ORDERFLOW_CONFIRMED":"ORDERFLOW_DIVERGENCE",execution:e};
 }
 global.MicrostructureV390000={obi,weightedMid,spread,depth,vwap,volumeZ,impactEstimate,liquidityScore,pressure,trapDetector,executionQuality,confirmation};
})(typeof globalThis!=="undefined"?globalThis:window);
