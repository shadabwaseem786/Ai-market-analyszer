// V112400 uncertainty over model selection.
function assess(scores=[]){
 const s=scores.map(Number).filter(Number.isFinite); if(s.length<2)return {version:"V112400",status:"INSUFFICIENT"};
 const spread=Math.max(...s)-Math.min(...s), uncertainty=Math.min(100,spread*1.5);
 return {version:"V112400",modelSelectionUncertainty:+uncertainty.toFixed(2),status:uncertainty<=20?"LOW":uncertainty<=40?"MEDIUM":"HIGH"};
}
module.exports={assess};