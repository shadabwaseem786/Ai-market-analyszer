// V107400 signal decay and half-life monitor.
function analyze(points=[]){
 const p=points.map(Number).filter(Number.isFinite); if(p.length<2)return {version:"V107400",status:"INSUFFICIENT"};
 const first=Math.abs(p[0])||1,last=Math.abs(p[p.length-1]); const retention=Math.min(100,last/first*100);
 return {version:"V107400",retention:+retention.toFixed(1),decay:+(100-retention).toFixed(1),status:retention<50?"FAST_DECAY":retention<75?"DECAYING":"STABLE"};
}
module.exports={analyze};