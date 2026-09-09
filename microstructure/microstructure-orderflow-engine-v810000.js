/* V810000 DEEP MICROSTRUCTURE + ORDER-FLOW INTELLIGENCE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function imbalance(bidQty,askQty){const b=Math.max(0,n(bidQty)),a=Math.max(0,n(askQty));return{bid:b,ask:a,ratio:a?b/a:null,score:(b+a)?(b-a)/(b+a):0}}
 function volumeDelta(buy,sell){const b=n(buy),s=n(sell);return{buy:b,sell:s,delta:b-s,deltaPct:(b+s)?(b-s)/(b+s):0}}
 function vwapDeviation(price,vwap,atr){const p=n(price),v=n(vwap),a=Math.max(1e-9,n(atr));return{distance:p-v,atrUnits:(p-v)/a,state:(p-v)/a>2?"EXTENDED-UP":(p-v)/a<-2?"EXTENDED-DOWN":"NORMAL"}}
 function absorption(x={}){const pressure=Math.abs(n(x.delta)),range=Math.abs(n(x.range));const score=clamp(n(x.volumeRatio,.5)*.35+n(x.reversal,.5)*.35+(range?Math.min(1,pressure/(range+1))*.3:.15),0,1);return{score,state:score>.75?"ABSORPTION":"NO-ABSORPTION"}}
 function exhaustion(x={}){const score=clamp(.3*n(x.deltaDivergence,.5)+.25*n(x.volumeSpike,.5)+.25*n(x.rangeFailure,.5)+.2*n(x.reversal,.5),0,1);return{score,state:score>.75?"EXHAUSTION":"NORMAL"}}
 function auction(x={}){const open=n(x.open),high=n(x.high),low=n(x.low),close=n(x.close);const range=Math.max(1e-9,high-low);return{openLocation:(open-low)/range,closeLocation:(close-low)/range,openingRangeBreak:close>high||close<low,acceptance:n(x.acceptance,.5),balance:n(x.balance,.5)}}
 function impact(notional,depth,volatility){const d=Math.max(1,n(depth)),v=Math.max(.0001,n(volatility));return Math.sqrt(Math.abs(n(notional))/d)*v}
 function footprint(x={}){const i=n(x.imbalance,.0),d=n(x.delta,.0),a=n(x.absorption,.5),e=n(x.exhaustion,.5);const score=clamp(.3*(i+1)/2+.3*(d+1)/2+.2*(1-a)+.2*(1-e),0,1);return{score,direction:score>.6?"BUY-PRESSURE":score<.4?"SELL-PRESSURE":"BALANCED"}}
 function spoofProxy(x={}){const add=n(x.addedLiquidity),cancel=n(x.cancelledLiquidity),fill=n(x.filledLiquidity);const ratio=(add>0?cancel/add:0);return{cancelAddRatio:ratio,flag:ratio>8&&fill<add*.1}}
 function fuse(x={}){const vals=[n(x.imbalance,.5),n(x.delta,.5),n(x.vwap,.5),n(x.absorption,.5),n(x.exhaustion,.5),n(x.footprint,.5)];const s=vals.reduce((a,b)=>a+b,0)/vals.length;return{score:clamp(s,0,1),direction:s>.6?"BULLISH":s<.4?"BEARISH":"NEUTRAL",confidence:Math.abs(s-.5)*2}}
 global.MicrostructureV810000={imbalance,volumeDelta,vwapDeviation,absorption,exhaustion,auction,impact,footprint,spoofProxy,fuse};
})(typeof globalThis!=="undefined"?globalThis:window);