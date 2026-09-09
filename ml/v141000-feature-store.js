// V141000 Feature Store — timestamped, immutable research features.
function put(store=[],item={}){return {version:"V141000",store:[...store,{...item,timestamp:item.timestamp||new Date().toISOString(),immutable:true}].slice(-50000),researchOnly:true};}
function latest(store=[],symbol){return [...store].reverse().find(x=>x.symbol===symbol)||null}
module.exports={put,latest};