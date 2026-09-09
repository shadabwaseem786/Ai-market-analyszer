/*
 V470000 EXECUTION + MARKET MICROSTRUCTURE INTELLIGENCE
 Spread/depth/liquidity, order-flow imbalance, VWAP/TWAP, volume profile,
 impact/slippage estimation, adverse selection, gap risk, auction context,
 execution-quality scoring and liquidity-adjusted sizing.
 Feed-agnostic; no automatic order placement.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 const sum=a=>a.reduce((s,x)=>s+n(x),0);
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function spreadScore(bid,ask,mid){const m=n(mid)||((n(bid)+n(ask))/2);const pct=m?((n(ask)-n(bid))/m)*100:Infinity;return {spread:n(ask)-n(bid),spreadPct:pct,score:clamp(1-pct/.5,0,1)}}
 function depthScore(bidQty,askQty,levels=1){const b=n(bidQty),a=n(askQty),t=b+a||1;return {bidDepth:b,askDepth:a,imbalance:(b-a)/t,score:clamp((Math.min(b,a)/(Math.max(b,a)||1)),0,1)}}
 function orderFlowImbalance(buyVol,sellVol){const b=n(buyVol),s=n(sellVol),t=b+s||1;return {buy:b,sell:s,imbalance:(b-s)/t,buyShare:b/t}}
 function vwap(trades=[]){let pv=0,v=0;for(const t of trades){const p=n(t.price),q=n(t.volume);pv+=p*q;v+=q}return v?pv/v:null}
 function twap(prices=[]){return prices.length?mean(prices):null}
 function volumeProfile(trades=[],bins=20){if(!trades.length)return[];const lo=Math.min(...trades.map(t=>n(t.price))),hi=Math.max(...trades.map(t=>n(t.price)));const w=(hi-lo)/(bins||1)||1,arr=Array.from({length:bins},(_,i)=>({bin:i,low:lo+i*w,high:i===bins-1?hi+1e-9:lo+(i+1)*w,volume:0}));trades.forEach(t=>{const i=Math.min(bins-1,Math.max(0,Math.floor((n(t.price)-lo)/w)));arr[i].volume+=n(t.volume)});return arr}
 function impactEstimate(orderQty,avgDepth,impactCoeff=.5){const q=n(orderQty),d=n(avgDepth)||1;return {participation:q/d,impactPct:impactCoeff*Math.sqrt(Math.max(0,q/d))*100}}
 function slippageForecast(spreadPct,participation,volatilityPct,liquidityScore=.7){const s=n(spreadPct)/2,p=n(participation),v=n(volatilityPct)*.1,l=1-clamp(n(liquidityScore),0,1);return {expectedSlippagePct:s+p*2+v+l*.5}}
 function liquidityAdjustedSize(baseUnits,liquidityScore,participationLimit=.1){const l=clamp(n(liquidityScore),0,1);return Math.floor(n(baseUnits)*l*Math.min(1,participationLimit/.1))}
 function adverseSelection(flowImbalance,postTradeMovePct){const same=(n(flowImbalance)>0&&n(postTradeMovePct)<0)||(n(flowImbalance)<0&&n(postTradeMovePct)>0);return {risk:same?"HIGH":"NORMAL",score:same?1:Math.abs(n(flowImbalance))}}
 function gapRisk(openPct,atrPct){const gap=Math.abs(n(openPct)),atr=n(atrPct)||1;return {gapPct:gap,atrMultiple:gap/atr,risk:gap/atr>=2?"HIGH":gap/atr>=1?"MEDIUM":"LOW"}}
 function auctionContext(ctx={}){return {imbalance:n(ctx.auctionBuyQty)-n(ctx.auctionSellQty),indicativeMovePct:n(ctx.indicativeMovePct),participation:n(ctx.auctionVolume),state:n(ctx.indicativeMovePct)>1?"BULLISH_BIAS":n(ctx.indicativeMovePct)<-1?"BEARISH_BIAS":"BALANCED"}}
 function executionQuality(ctx={}){const score=clamp(.25*n(ctx.spreadScore,.5)+.2*n(ctx.depthScore,.5)+.2*n(ctx.liquidityScore,.5)+.15*(1-clamp(n(ctx.slippagePct)/1,0,1))+.1*(1-clamp(n(ctx.impactPct)/1,0,1))+.1*(1-clamp(n(ctx.adverseSelectionScore),0,1)),0,1);return {score,state:score>=.75?"EXCELLENT":score>=.55?"GOOD":score>=.4?"CAUTION":"POOR"}}
 function executionPlan(ctx={}){const q=executionQuality(ctx),s=slippageForecast(ctx.spreadPct,ctx.participation,ctx.volatilityPct,ctx.liquidityScore);return {quality:q,expectedSlippagePct:s.expectedSlippagePct,preferredMethod:q.score>.7?"LIMIT/VWAP":q.score>.45?"PASSIVE_LIMIT":"WAIT_FOR_LIQUIDITY"}}
 global.ExecutionMicrostructureV470000={spreadScore,depthScore,orderFlowImbalance,vwap,twap,volumeProfile,impactEstimate,slippageForecast,liquidityAdjustedSize,adverseSelection,gapRisk,auctionContext,executionQuality,executionPlan};
})(typeof globalThis!=="undefined"?globalThis:window);
