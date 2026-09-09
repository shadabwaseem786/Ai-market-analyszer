/*
 V510000 DATA ADAPTER CONTRACT
 Feed-agnostic normalization boundary for live market/event providers.
 No provider credentials are stored in frontend code.
*/
(function(global){
 const n=(x,d=null)=>Number.isFinite(Number(x))?Number(x):d;
 function normalizeQuote(q={}){return {symbol:String(q.symbol||q.s||""),timestamp:q.timestamp||q.ts||new Date().toISOString(),last:n(q.last??q.ltp),bid:n(q.bid),ask:n(q.ask),bidQty:n(q.bidQty),askQty:n(q.askQty),volume:n(q.volume),oi:n(q.oi),source:q.source||"UNKNOWN"}}
 function normalizeBar(b={}){return {symbol:String(b.symbol||""),timestamp:b.timestamp||b.ts,open:n(b.open),high:n(b.high),low:n(b.low),close:n(b.close),volume:n(b.volume),oi:n(b.oi),source:b.source||"UNKNOWN"}}
 function normalizeEvent(e={}){return {id:e.id||e.guid||null,title:String(e.title||"").trim(),publishedAt:e.publishedAt||e.timestamp||null,source:e.source||"UNKNOWN",sourceTier:e.sourceTier||"UNKNOWN",entities:Array.isArray(e.entities)?e.entities:[],sector:e.sector||"UNKNOWN",type:e.type||"OTHER",expected:n(e.expected),actual:n(e.actual),text:e.text||""}}
 function validate(o,required){return {valid:required.every(k=>o[k]!==null&&o[k]!==undefined&&o[k]!==""),missing:required.filter(k=>o[k]===null||o[k]===undefined||o[k]==="")}}
 global.DataAdapterV510000={normalizeQuote,normalizeBar,normalizeEvent,validate};
})(typeof globalThis!=="undefined"?globalThis:window);
