/*
 V170000 MICROSTRUCTURE + SMART MONEY + ORDER-FLOW INTELLIGENCE
 Decision-support analytics from supplied F&O observations.
 No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function basisSignal(x={}){
   const spot=n(x.spot),fut=n(x.future);
   if(!spot||!fut)return {score:0,state:"INSUFFICIENT_DATA"};
   const basis=(fut-spot)/spot*100;
   return {basis,basisScore:clamp(basis*20,-100,100),
     state:basis>0.25?"BULLISH_BASIS":basis<-0.25?"BEARISH_BASIS":"NEUTRAL"};
 }
 function oiPriceSignal(x={}){
   const dp=n(x.priceChange),doi=n(x.oiChange);
   const score=clamp(dp*8+doi*3,-100,100);
   let state="NEUTRAL";
   if(dp>0&&doi>0)state="LONG_BUILDUP";
   else if(dp<0&&doi>0)state="SHORT_BUILDUP";
   else if(dp>0&&doi<0)state="SHORT_COVERING";
   else if(dp<0&&doi<0)state="LONG_UNWINDING";
   return {score,state,priceChange:dp,oiChange:doi};
 }
 function flowImbalance(x={}){
   const buy=n(x.buyVolume),sell=n(x.sellVolume),tot=buy+sell;
   if(!tot)return {imbalance:0,score:0,state:"INSUFFICIENT_DATA"};
   const imbalance=(buy-sell)/tot*100;
   return {imbalance,score:clamp(imbalance*2,-100,100),
     state:imbalance>15?"BUY_PRESSURE":imbalance<-15?"SELL_PRESSURE":"BALANCED"};
 }
 function optionStructure(x={}){
   const callOI=n(x.callOI),putOI=n(x.putOI);
   if(!callOI&&!putOI)return {pcr:null,score:0,state:"INSUFFICIENT_DATA"};
   const pcr=putOI/(callOI||1);
   const score=clamp((pcr-1)*100,-100,100);
   return {pcr,score,state:pcr>1.2?"PUT_HEAVY":pcr<.8?"CALL_HEAVY":"BALANCED"};
 }
 function anomaly(x={}){
   const volZ=Math.abs(n(x.volumeZ)),oiZ=Math.abs(n(x.oiZ)),priceZ=Math.abs(n(x.priceZ));
   const score=clamp((volZ+oiZ+priceZ)/3*25,0,100);
   return {score,abnormal:score>=70,components:{volZ,oiZ,priceZ}};
 }
 function smartMoney(x={}){
   const b=basisSignal(x),o=oiPriceSignal(x),f=flowImbalance(x),p=optionStructure(x),a=anomaly(x);
   const raw=clamp(.2*b.basisScore+.3*o.score+.25*f.score+.15*p.score+(x.anomalyDirection==="BUY"?a.score:x.anomalyDirection==="SELL"?-a.score:0),-100,100);
   return {basis:b,oiPrice:o,flow:f,options:p,anomaly:a,score:raw,
     bias:raw>=25?"BULLISH":raw<=-25?"BEARISH":"NEUTRAL"};
 }
 global.MicrostructureV170000={basisSignal,oiPriceSignal,flowImbalance,optionStructure,anomaly,smartMoney};
})(typeof globalThis!=="undefined"?globalThis:window);
