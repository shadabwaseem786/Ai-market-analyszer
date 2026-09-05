// V122300 temporal stability assessment.
function stability(samples=[]){
 if(!samples.length)return {version:"V122300",stability:0,state:"INSUFFICIENT"};
 const mean=samples.reduce((a,b)=>a+Number(b),0)/samples.length;
 const variance=samples.reduce((a,b)=>a+(Number(b)-mean)**2,0)/samples.length;
 const cv=Math.sqrt(variance)/(Math.abs(mean)||1),score=Math.max(0,100-cv*100);
 return {version:"V122300",mean:+mean.toFixed(4),volatility:+Math.sqrt(variance).toFixed(4),stability:+score.toFixed(2),state:score>=75?"STABLE":score>=50?"MIXED":"UNSTABLE"};
}
module.exports={stability};