// V117100 timestamp synchronization.
function sync(records=[],maxSkewMs=60000){
 const ts=records.map(r=>new Date(r.timestamp).getTime()).filter(Number.isFinite); if(!ts.length)return {version:"V117100",status:"INSUFFICIENT"};
 const skew=Math.max(...ts)-Math.min(...ts);
 return {version:"V117100",minTimestamp:new Date(Math.min(...ts)).toISOString(),maxTimestamp:new Date(Math.max(...ts)).toISOString(),skewMs:skew,synchronized:skew<=maxSkewMs,status:skew<=maxSkewMs?"ALIGNED":"MISALIGNED"};
}
module.exports={sync};