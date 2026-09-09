// V122100 event sequence detector.
function sequence(events=[]){
 const ordered=[...events].filter(e=>e.timestamp).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
 return {version:"V122100",sequence:ordered.map((e,i)=>({order:i+1,id:e.id,type:e.type,timestamp:e.timestamp})),durationMs:ordered.length>1?new Date(ordered.at(-1).timestamp)-new Date(ordered[0].timestamp):0};
}
module.exports={sequence};