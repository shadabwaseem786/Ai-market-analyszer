// V124300 ensemble calibration tracker.
function update(history=[],prediction){
 const bucket=prediction?.bucket||"DEFAULT", prior=history.filter(x=>x.bucket===bucket), n=prior.length+1;
 const err=prior.length?prior.reduce((a,x)=>a+Math.abs(Number(x.probability)-Number(x.outcome)*100),0)/prior.length:Math.abs(Number(prediction?.probability||50)-Number(prediction?.outcome||.5)*100);
 return {version:"V124300",bucket,sampleSize:n,meanAbsoluteCalibrationError:+err.toFixed(2),reliability:n>=30&&err<=15?"CALIBRATED":"UNVERIFIED"};
}
module.exports={update};