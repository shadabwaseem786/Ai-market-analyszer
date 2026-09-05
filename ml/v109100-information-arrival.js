// V109100 information-arrival sequencing and latency awareness.
function sequence(events=[]){
 const rows=[...events].sort((a,b)=>new Date(a.time||0)-new Date(b.time||0));
 let violations=0; for(let i=1;i<rows.length;i++) if(new Date(rows[i].time||0)<new Date(rows[i-1].time||0))violations++;
 const latency=rows.map(e=>Number(e.latencyMs)||0).filter(x=>x>0); const avg=latency.length?latency.reduce((a,b)=>a+b,0)/latency.length:0;
 return {version:"V109100",events:rows.length,ordering:"CHRONOLOGICAL",violations,averageLatencyMs:+avg.toFixed(1),latencyRisk:avg>30000?"HIGH":avg>5000?"MEDIUM":"LOW"};
}
module.exports={sequence};