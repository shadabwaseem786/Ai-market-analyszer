// V106200 probabilistic calibration monitor. Research-only.
function monitor(predicted=[],outcomes=[]){
 const n=Math.min(predicted.length,outcomes.length); if(!n)return {version:"V106200",status:"NO_DATA"};
 let err=0; for(let i=0;i<n;i++)err+=Math.abs(Number(predicted[i])-Number(outcomes[i]));
 const mae=err/n; return {version:"V106200",samples:n,calibrationError:+mae.toFixed(3),status:mae<=10?"CALIBRATED":mae<=20?"WATCH":"POOR"};
}
module.exports={monitor};