// V126400 orchestration audit trail.
function audit(steps=[]){
 return {version:"V126400",steps:steps.map((s,i)=>({order:i+1,agent:s.agent||"UNKNOWN",status:s.status||"UNKNOWN",durationMs:Number(s.durationMs)||0,reason:s.reason||""})),completed:steps.every(s=>s.status==="OK"),researchOnly:true};
}
module.exports={audit};