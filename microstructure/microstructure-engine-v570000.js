/*
 V570000 MICROSTRUCTURE + INTRADAY REGIME INTELLIGENCE 2.0
 Order-flow proxies, OI/price interaction, VWAP, volume anomalies, liquidity,
 volatility state, trend/chop regime, transition detection and entry-quality.
 Data-source adapters must provide authorized real market observations.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 function imbalance(bidVol,askVol){const b=n(bidVol),a=n(askVol);return (b-a)/(b+a||1)}
 function oiPriceSignal(priceChange,oiChange){const p=n(priceChange),o=n(oiChange);if(p>0&&o>0)return"BULLISH_BUILDUP";if(p<0&&o>0)return"BEARISH_BUILDUP";if(p>0&&o<0)return"SHORT_COVERING";if(p<0&&o<0)return"LONG_UNWIND";return"NEUTRAL"}
 function vwap(rows=[]){let pv=0,v=0;for(const r of rows){const px=n(r.price),vol=n(r.volume);pv+=px*vol;v+=vol}return v?pv/v:null}
 function volumeAnomaly(current,baseline=[],zThreshold=2){const m=mean(baseline),sd=Math.sqrt(mean(baseline.map(x=>(n(x)-m)**2)))||1;const z=(n(current)-m)/sd;return {z,anomaly:Math.abs(z)>=zThreshold,direction:z>0?"HIGH":"LOW"}}
 function volatilityState(returns=[],low=.01,high=.03){const sd=Math.sqrt(mean(returns.map(x=>(n(x)-mean(returns))**2)));return {value:sd,state:sd>=high?"EXPANSION":sd<=low?"COMPRESSION":"NORMAL"}}
 function trendStrength(prices=[]){if(prices.length<3)return 0;let up=0,down=0;for(let i=1;i<prices.length;i++){if(n(prices[i])>n(prices[i-1]))up++;else if(n(prices[i])<n(prices[i-1]))down++}return (up-down)/Math.max(1,prices.length-1)}
 function regime(prices=[],returns=[]){const ts=trendStrength(prices),vs=volatilityState(returns);if(Math.abs(ts)<.2&&vs.state!=="EXPANSION")return"CHOP";if(ts>=.2&&vs.state==="EXPANSION")return"BULL_TREND_EXPANSION";if(ts<=-.2&&vs.state==="EXPANSION")return"BEAR_TREND_EXPANSION";if(ts>=.2)return"BULL_TREND";if(ts<=-.2)return"BEAR_TREND";return"TRANSITION"}
 function regimeTransition(prev,current){return {changed:prev!==current,from:prev,to:current,severity:prev===current?"NONE":(["CHOP","TRANSITION"].includes(prev)||["CHOP","TRANSITION"].includes(current))?"MEDIUM":"HIGH"}}
 function liquidityScore(x={}){const spread=clamp(n(x.spreadBps)/100,0,1),depth=clamp(n(x.depthScore,.5),0,1),impact=clamp(n(x.priceImpact,.5),0,1);return clamp(.35*(1-spread)+.35*depth+.3*(1-impact),0,1)}
 function priceAcceleration(prices=[],window=5){if(prices.length<window*2)return 0;const a=(n(prices.at(-window))-n(prices.at(-2*window)))/(Math.abs(n(prices.at(-2*window)))||1);const b=(n(prices.at(-1))-n(prices.at(-window)))/(Math.abs(n(prices.at(-window)))||1);return b-a}
 function entryQuality(x={}){const imb=Math.abs(n(x.imbalance)),vw=clamp(n(x.vwapDistanceScore,.5),0,1),liq=clamp(n(x.liquidityScore,.5),0,1),reg=clamp(n(x.regimeAlignment,.5),0,1),vol=clamp(n(x.volumeConfirmation,.5),0,1);return clamp(.2*imb+.2*vw+.25*liq+.2*reg+.15*vol,0,1)}
 function microstructureSnapshot(x={}){return {timestamp:x.timestamp||new Date().toISOString(),symbol:x.symbol||"",imbalance:imbalance(x.bidVolume,x.askVolume),vwap:vwap(x.bars||[]),oiPrice:oiPriceSignal(x.priceChange,x.oiChange),volume:volumeAnomaly(x.currentVolume,x.baselineVolume||[]),volatility:volatilityState(x.returns||[]),regime:regime(x.prices||[],x.returns||[]),liquidity:liquidityScore(x),acceleration:priceAcceleration(x.prices||[])}}
 global.MicrostructureV570000={imbalance,oiPriceSignal,vwap,volumeAnomaly,volatilityState,trendStrength,regime,regimeTransition,liquidityScore,priceAcceleration,entryQuality,microstructureSnapshot};
})(typeof globalThis!=="undefined"?globalThis:window);
