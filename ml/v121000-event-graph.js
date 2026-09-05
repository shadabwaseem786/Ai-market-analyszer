// V121000 Event Graph & Catalyst Memory — persistent relationship representation. Research-only.
function addEvent(event={},relations=[]){
 return {version:"V121000",event:{id:event.id||"EVT-"+Date.now(),type:event.type||"UNKNOWN",title:event.title||"",timestamp:event.timestamp||new Date().toISOString(),surprise:Number(event.surprise)||0,materiality:Number(event.materiality)||0},relations:relations.map(r=>({from:r.from,to:r.to,type:r.type||"INFLUENCES",strength:Number(r.strength)||0,lagMinutes:Number(r.lagMinutes)||null})),researchOnly:true};
}
module.exports={addEvent};