// V117200 multi-source conflict detection.
function detect(records=[],tolerance=0.5){
 const groups={}; for(const r of records){if(r.key==null||!Number.isFinite(Number(r.value)))continue;(groups[r.key]??=[]).push(Number(r.value))}
 const conflicts=Object.entries(groups).filter(([,v])=>v.length>1&&(Math.max(...v)-Math.min(...v))>tolerance).map(([key,v])=>({key,values:v,spread:Math.max(...v)-Math.min(...v)}));
 return {version:"V117200",conflicts,conflictCount:conflicts.length,status:conflicts.length?"CONFLICT":"CONSISTENT"};
}
module.exports={detect};