/*
 V180000 LIQUIDITY + MARKET IMPACT + GAMMA/MAX-PAIN + CONFLUENCE
 Decision-support layer. No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function spreadQuality(x={}){
   const bid=n(x.bid),ask=n(x.ask),mid=(bid+ask)/2;
   if(!mid)return {spreadPct:null,score:0,state:"INSUFFICIENT_DATA"};
   const pct=(ask-bid)/mid*100;
   return {spreadPct:pct,score:clamp(100-pct*100,0,100),
     state:pct<=.15?"LIQUID":pct<=.4?"MODERATE":"THIN"};
 }
 function impactProxy(x={}){
   const value=n(x.tradeValue),volume=n(x.volume),adv=n(x.advValue);
   const participation=adv?value/adv:volume/(n(x.advVolume)||1);
   return {participation,score:clamp(100-participation*200,0,100),
     state:participation>.25?"HIGH_IMPACT_RISK":participation>.1?"MODERATE":"LOW"};
 }
 function gammaMap(chain=[],spot=0){
   const levels={};
   chain.forEach(x=>{
     const k=String(n(x.strike)); levels[k]=(levels[k]||0)+n(x.gamma)*n(x.openInterest,1);
   });
   const sorted=Object.entries(levels).map(([strike,gamma])=>({strike:Number(strike),gamma}))
     .sort((a,b)=>Math.abs(b.gamma)-Math.abs(a.gamma));
   return {spot,levels:sorted,topGamma:sorted.slice(0,8)};
 }
 function maxPain(chain=[]){
   const strikes=[...new Set(chain.map(x=>n(x.strike)).filter(Boolean))].sort((a,b)=>a-b);
   if(!strikes.length)return {strike:null,loss:null};
   const rows=strikes.map(s=>{
     let loss=0;
     chain.forEach(x=>{
       const k=n(x.strike),call=n(x.callOI),put=n(x.putOI);
       loss+=Math.max(s-k,0)*call+Math.max(k-s,0)*put;
     });
     return {strike:s,loss};
   });
   return rows.reduce((a,b)=>b.loss<a.loss?b:a,rows[0]);
 }
 function levels(x={}){
   const support=(x.support||[]).map(n).sort((a,b)=>b-a);
   const resistance=(x.resistance||[]).map(n).sort((a,b)=>a-b);
   return {support,resistance,nearestSupport:support[0]||null,nearestResistance:resistance[0]||null};
 }
 function confluence(x={}){
   const s=[n(x.trend),n(x.momentum),n(x.microstructure),n(x.catalyst),n(x.gammaBias),n(x.memory)];
   const avg=s.reduce((a,b)=>a+b,0)/(s.length||1);
   const conflicts=s.filter(v=>Math.sign(v)!==Math.sign(avg)&&Math.abs(v)>20).length;
   return {score:clamp(avg,-100,100),conflicts,
     state:conflicts>=2?"CONFLICT":Math.abs(avg)>=60?"STRONG":Math.abs(avg)>=30?"MODERATE":"WEAK"};
 }
 function marketStructure(x={}){
   const l=levels(x),sp=spreadQuality(x),ip=impactProxy(x);
   const gm=gammaMap(x.chain||[],n(x.spot)),mp=maxPain(x.chain||[]);
   const cf=confluence(x);
   const tradable=sp.state!=="THIN"&&ip.state!=="HIGH_IMPACT_RISK"&&cf.state!=="CONFLICT";
   return {liquidity:sp,impact:ip,gamma:gm,maxPain:mp,levels:l,confluence:cf,tradable};
 }
 global.MarketStructureV180000={spreadQuality,impactProxy,gammaMap,maxPain,levels,confluence,marketStructure};
})(typeof globalThis!=="undefined"?globalThis:window);
