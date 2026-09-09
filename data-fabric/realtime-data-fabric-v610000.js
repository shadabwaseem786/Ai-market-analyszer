/* V610000 REAL-TIME DATA FABRIC + POINT-IN-TIME FEATURE STORE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const now=()=>Date.now();
 function normalizeTick(x={}){
   return {symbol:String(x.symbol||""),timestamp:new Date(x.timestamp||now()).toISOString(),
     price:n(x.price),volume:n(x.volume),oi:n(x.oi),bid:n(x.bid),ask:n(x.ask),source:String(x.source||"unknown")};
 }
 function dataQuality(t={},cfg={}){
   const age=Math.max(0,now()-new Date(t.timestamp||0).getTime());
   const maxAge=n(cfg.maxAgeMs,60000), required=["symbol","timestamp","price"];
   const missing=required.filter(k=>t[k]===undefined||t[k]===null||t[k]==="");
   return {fresh:age<=maxAge,ageMs:age,missing,valid:missing.length===0&&Number.isFinite(new Date(t.timestamp).getTime())&&n(t.price)>0,quality:missing.length?0:(age<=maxAge?1:.5)};
 }
 function snapshot(ticks=[]){const by={};for(const raw of ticks){const t=normalizeTick(raw);by[t.symbol]??=[];by[t.symbol].push(t)}
   return Object.fromEntries(Object.entries(by).map(([s,a])=>[s,a.sort((x,y)=>new Date(x.timestamp)-new Date(y.timestamp)).at(-1)]));
 }
 function staleGuard(t,cfg){const q=dataQuality(t,cfg);return {...q,action:q.valid&&q.fresh?"ACCEPT":"REJECT_OR_FALLBACK"}}
 function pointInTime(features=[],cutoff){const c=new Date(cutoff||now()).getTime();return features.filter(x=>new Date(x.timestamp).getTime()<=c).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));}
 function featureRecord(x={}){return {featureId:x.featureId||"",symbol:x.symbol||"",timestamp:new Date(x.timestamp||now()).toISOString(),value:n(x.value),source:x.source||"derived",version:x.version||"1.0"}}
 function incremental(prev={},tick={}){const t=normalizeTick(tick);return {...prev,lastPrice:t.price,lastVolume:t.volume,lastOI:t.oi,lastTimestamp:t.timestamp,
   priceChange:n(prev.lastPrice)?t.price-n(prev.lastPrice):0,volumeDelta:n(prev.lastVolume)?t.volume-n(prev.lastVolume):t.volume,oiDelta:n(prev.lastOI)?t.oi-n(prev.lastOI):0}}
 function replay(events=[],from,to){const a=events.map(normalizeTick).filter(t=>{const z=new Date(t.timestamp).getTime();return z>=new Date(from).getTime()&&z<=new Date(to).getTime()});return a.sort((x,y)=>new Date(x.timestamp)-new Date(y.timestamp))}
 function detectGaps(events=[],intervalMs){const a=events.map(normalizeTick).sort((x,y)=>new Date(x.timestamp)-new Date(y.timestamp)),g=[];for(let i=1;i<a.length;i++){const d=new Date(a[i].timestamp)-new Date(a[i-1].timestamp);if(d>intervalMs*1.5)g.push({from:a[i-1].timestamp,to:a[i].timestamp,gapMs:d})}return g}
 function eventEnvelope(type,payload={},source="system"){return {eventId:(global.crypto?.randomUUID?.()||String(Math.random())),type,source,timestamp:new Date().toISOString(),payload}}
 global.DataFabricV610000={normalizeTick,dataQuality,snapshot,staleGuard,pointInTime,featureRecord,incremental,replay,detectGaps,eventEnvelope};
})(typeof globalThis!=="undefined"?globalThis:window);