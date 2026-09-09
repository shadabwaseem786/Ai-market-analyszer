/* V650000 MARKET MICROSTRUCTURE + ORDER FLOW */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function spread(bid,ask,mid){const b=n(bid),a=n(ask),m=n(mid)||((a+b)/2);return m?Math.max(0,a-b)/m:0}
 function imbalance(bidSize,askSize){const b=Math.max(0,n(bidSize)),a=Math.max(0,n(askSize));return (b-a)/(b+a||1)}
 function volumeImbalance(aggressiveBuy,aggressiveSell){const b=Math.max(0,n(aggressiveBuy)),s=Math.max(0,n(aggressiveSell));return (b-s)/(b+s||1)}
 function vwapDeviation(price,vwap){const p=n(price),v=n(vwap);return v?((p-v)/v):0}
 function flowState(x={}){const oi=n(x.oiChange),price=n(x.priceChange),vi=volumeImbalance(x.aggressiveBuy,x.aggressiveSell),ob=imbalance(x.bidSize,x.askSize);
   let state="BALANCED";
   if(vi>.25&&ob>.15&&price>0)state="AGGRESSIVE_BUYING";
   else if(vi<-.25&&ob<-.15&&price<0)state="AGGRESSIVE_SELLING";
   else if(oi>0&&price>0)state="LONG_BUILDUP";
   else if(oi>0&&price<0)state="SHORT_BUILDUP";
   else if(oi<0&&price>0)state="SHORT_COVERING";
   else if(oi<0&&price<0)state="LONG_UNWINDING";
   return{state,volumeImbalance:vi,orderImbalance:ob};
 }
 function absorption(x={}){const vi=volumeImbalance(x.aggressiveBuy,x.aggressiveSell),move=Math.abs(n(x.priceChange)),vol=n(x.volume);return{score:clamp(Math.abs(vi)*(1/(1+move*100))*Math.min(1,vol/Math.max(1,n(x.volumeBaseline,vol))),0,1),possible:Math.abs(vi)>.35&&move<n(x.maxMove,.002)}}
 function exhaustion(x={}){const move=Math.abs(n(x.priceChange)),vol=n(x.volume),base=n(x.volumeBaseline,vol);return{score:clamp(move*Math.min(3,vol/(base||1))*100,0,1),possible:move>n(x.moveThreshold,.01)&&vol>base}}
 function breakoutQuality(x={}){const volRatio=n(x.volume)/Math.max(1,n(x.volumeBaseline,1)),ob=imbalance(x.bidSize,x.askSize),vi=volumeImbalance(x.aggressiveBuy,x.aggressiveSell),vwap=vwapDeviation(x.price,x.vwap);
   const score=clamp(.3*Math.min(2,volRatio)/2+.25*clamp((ob+1)/2,0,1)+.25*clamp((vi+1)/2,0,1)+.2*clamp((vwap+0.01)/0.02,0,1),0,1);
   return{score,confirmed:score>=.65};
 }
 function liquidityPressure(x={}){const sp=spread(x.bid,x.ask,x.price),depth=n(x.bidSize)+n(x.askSize),vi=Math.abs(volumeImbalance(x.aggressiveBuy,x.aggressiveSell));return{spread:sp,depth,pressure:clamp(.5*vi+.5*Math.min(1,sp/.005),0,1)}}
 function optionPressure(chain=[]){let call=0,put=0,callOI=0,putOI=0;for(const o of chain){const oi=Math.max(0,n(o.oi));if(String(o.type).toUpperCase()==="CE"){call+=oi*n(o.volume,1);callOI+=oi}else{put+=oi*n(o.volume,1);putOI+=oi}}const total=call+put||1;return{callPressure:call/total,putPressure:put/total,putCallOI:putOI/(callOI||1)}}
 function futuresBasis(spot,future){const s=n(spot),f=n(future);return s?((f-s)/s):0}
 function anomaly(x={}){const flags=[];if(n(x.spreadRatio)>n(x.maxSpreadRatio,.03))flags.push("WIDE_SPREAD");if(Math.abs(n(x.orderImbalance))>n(x.maxOrderImbalance,.9)&&Math.abs(n(x.priceChange))<n(x.maxPriceMove,.001))flags.push("DEPTH_ANOMALY");if(n(x.volume)>n(x.volumeBaseline,1)*n(x.volumeSpike,5)&&Math.abs(n(x.priceChange))<n(x.maxPriceMove,.001))flags.push("VOLUME_PRICE_ANOMALY");return{flags,anomalous:flags.length>0}}
 function microstructureScore(x={}){const f=flowState(x),b=breakoutQuality(x),l=liquidityPressure(x),a=anomaly({...x,orderImbalance:f.orderImbalance,spreadRatio:l.spread});return{flow:f,breakout:b,liquidity:l,anomaly:a,score:clamp(.35*clamp((f.volumeImbalance+1)/2,0,1)+.35*b.score+.3*(1-l.pressure),0,1)}}
 global.MicrostructureV650000={spread,imbalance,volumeImbalance,vwapDeviation,flowState,absorption,exhaustion,breakoutQuality,liquidityPressure,optionPressure,futuresBasis,anomaly,microstructureScore};
})(typeof globalThis!=="undefined"?globalThis:window);