/*
 V250000 MARKET MICROSTRUCTURE 2.0
 Order-book imbalance, liquidity vacuum, execution pressure and flow proxies.
 These are market-structure proxies, NOT identification of specific institutions.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function bookImbalance(bids=[],asks=[]){
   const bv=bids.reduce((s,x)=>s+n(x.size),0), av=asks.reduce((s,x)=>s+n(x.size),0);
   const total=bv+av||1, score=(bv-av)/total*100;
   return {bidVolume:bv,askVolume:av,score,side:score>=15?"BUY_PRESSURE":score<=-15?"SELL_PRESSURE":"BALANCED"};
 }
 function depthQuality(bids=[],asks=[],levels=5){
   const b=bids.slice(0,levels).reduce((s,x)=>s+n(x.size),0);
   const a=asks.slice(0,levels).reduce((s,x)=>s+n(x.size),0);
   const depth=b+a;
   return {bidDepth:b,askDepth:a,totalDepth:depth,quality:clamp(Math.log10(depth+1)*20,0,100)};
 }
 function liquidityVacuum(x={}){
   const normal= n(x.normalDepth,1), current=n(x.currentDepth);
   const ratio=current/normal;
   const spread=n(x.spreadPct);
   const vacuum=clamp((1-ratio)*70+Math.max(0,spread-.2)*60,0,100);
   return {depthRatio:ratio,vacuum,level:vacuum>=70?"SEVERE":vacuum>=40?"ELEVATED":"NORMAL"};
 }
 function executionPressure(trades=[]){
   let buy=0,sell=0;
   trades.forEach(t=>{const v=n(t.value); if(String(t.side).toUpperCase()==="B")buy+=v;else if(String(t.side).toUpperCase()==="S")sell+=v});
   const total=buy+sell||1, score=(buy-sell)/total*100;
   return {buyValue:buy,sellValue:sell,score,side:score>=15?"BUY_PRESSURE":score<=-15?"SELL_PRESSURE":"BALANCED"};
 }
 function flowProxy(x={}){
   const oi=n(x.oiChange),price=n(x.priceChange),volume=n(x.volumeZ,0);
   let state="NEUTRAL";
   if(price>0&&oi>0)state="LONG_BUILDUP";
   else if(price<0&&oi>0)state="SHORT_BUILDUP";
   else if(price>0&&oi<0)state="SHORT_COVERING";
   else if(price<0&&oi<0)state="LONG_UNWINDING";
   return {state,volumeZ:volume,conviction:clamp(Math.abs(oi)*.5+Math.abs(price)*.5+Math.abs(volume)*10,0,100)};
 }
 function microstructure2(x={}){
   const bi=bookImbalance(x.bids||[],x.asks||[]);
   const dq=depthQuality(x.bids||[],x.asks||[],n(x.levels,5));
   const lv=liquidityVacuum(x);
   const ep=executionPressure(x.trades||[]);
   const fp=flowProxy(x);
   const veto=lv.level==="SEVERE";
   return {imbalance:bi,depth:dq,vacuum:lv,execution:ep,flow:fp,veto,
     composite:clamp(.30*bi.score+.30*ep.score+.20*(fp.state==="LONG_BUILDUP"||fp.state==="SHORT_COVERING"?fp.conviction:0)*(bi.score>=0?1:-1),-100,100)};
 }
 global.MicrostructureV250000={bookImbalance,depthQuality,liquidityVacuum,executionPressure,flowProxy,microstructure2};
})(typeof globalThis!=="undefined"?globalThis:window);
