// V109000 Temporal Market Brain — event-time reasoning and catalyst lifecycle. Research-only.
function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,Number(x)||0))}
function analyze(events=[],now=Date.now()){
 const rows=events.map((e,i)=>{const t=new Date(e.time||now).getTime(); const age=Math.max(0,(now-t)/3600000); const halfLife=Math.max(.1,Number(e.halfLifeHours)||6); const freshness=100*Math.pow(.5,age/halfLife); return {id:e.id||"E"+(i+1),type:e.type||"UNKNOWN",ageHours:+age.toFixed(2),freshness:+clamp(freshness).toFixed(1),impact:clamp(e.impact??50),time:e.time||null}});
 const weighted=rows.reduce((s,e)=>s+e.freshness*e.impact,0)/Math.max(1,rows.reduce((s,e)=>s+e.impact,0));
 return {version:"V109000",events:rows,temporalFreshness:+weighted.toFixed(1),lifecycle:weighted>=70?"FRESH":weighted>=40?"MATURE":"DECAYED",researchOnly:true};
}
module.exports={analyze};