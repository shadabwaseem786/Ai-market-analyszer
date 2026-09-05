// V127100 point-in-time information filter.
function filter(record={},cutoff){
 const t=new Date(cutoff).getTime(), fields=record.fields||{},out={};
 for(const [k,v] of Object.entries(fields)){const ts=new Date(v.availableAt||v.timestamp||0).getTime();if(ts<=t)out[k]={...v}}
 return {version:"V127100",cutoff,available:out,excludedCount:Object.keys(fields).length-Object.keys(out).length,lookAheadSafe:true};
}
module.exports={filter};