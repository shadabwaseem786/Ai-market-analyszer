// V127000 Market Digital Twin Replay Engine — strict point-in-time research replay.
function replay(events=[],onStep){
 const ordered=[...events].filter(e=>e.timestamp).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
 let state={},steps=[];
 for(const e of ordered){state={...state,...(e.state||{})};const available=Array.isArray(e.availableData)?e.availableData:[];const output=typeof onStep==="function"?onStep({timestamp:e.timestamp,state:{...state},availableData:[...available],event:e}):null;steps.push({timestamp:e.timestamp,eventId:e.id||null,availableData:available,output})}
 return {version:"V127000",steps,count:steps.length,lookAheadBlocked:true,researchOnly:true};
}
module.exports={replay};