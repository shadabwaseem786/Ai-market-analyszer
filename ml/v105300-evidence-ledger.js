// V105300 immutable-style evidence ledger. Research-only.
function ledger(items=[]){
 return items.map((x,i)=>({id:x.id||"E"+(i+1),source:x.source||"unknown",claim:String(x.claim||""),direction:x.direction||"NEUTRAL",strength:Math.max(0,Math.min(100,Number(x.strength)||0)),timestamp:x.timestamp||null,independent:x.independent!==false}));
}
module.exports={ledger};