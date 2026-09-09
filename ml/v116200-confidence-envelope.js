// V116200 confidence envelope — separates conviction from uncertainty.
function envelope(x={}){
 const p=Number(x.probability)||50,u=Math.max(0,Math.min(100,Number(x.uncertainty)||50)),spread=u*.5;
 return {version:"V116200",centralProbability:+p.toFixed(2),lowerBound:+Math.max(0,p-spread).toFixed(2),upperBound:+Math.min(100,p+spread).toFixed(2),width:+(spread*2).toFixed(2),calibratedEnvelope:false};
}
module.exports={envelope};