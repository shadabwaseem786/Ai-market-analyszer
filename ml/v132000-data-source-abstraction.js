// V132000 Data Source Abstraction — provider-neutral, no broker order capability.
const TYPES=["MARKET","OPTIONS","FII_DII","NEWS","MACRO","GLOBAL","CORPORATE","SENTIMENT"];
function normalize(packet={}){
 return {version:"V132000",source:packet.source||"UNKNOWN",timestamp:packet.timestamp||null,type:packet.type||"MARKET",symbol:packet.symbol||null,fields:packet.fields||{},quality:Number(packet.quality??0),stale:Boolean(packet.stale),authenticated:Boolean(packet.authenticated),tradingCapability:false};
}
function freshness(timestamp,now=Date.now(),maxAgeMs=60000){
 const age=Math.max(0,now-new Date(timestamp).getTime()); return {ageMs:age,fresh:age<=maxAgeMs};
}
module.exports={TYPES,normalize,freshness};