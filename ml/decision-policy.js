// V19400: ensemble decision policy with abstention.
function decide(models,{minConfidence=.60,maxUncertainty=.45,maxSpread=.15}={}){
 const valid=(models||[]).filter(m=>Number.isFinite(m.probability)); if(!valid.length)return {action:"ABSTAIN",reason:"NO_MODELS"};
 const p=valid.reduce((s,m)=>s+m.probability,0)/valid.length,spread=Math.max(...valid.map(m=>m.probability))-Math.min(...valid.map(m=>m.probability));
 const confidence=Math.abs(p-.5)*2,uncertainty=1-confidence;
 if(confidence<minConfidence||uncertainty>maxUncertainty||spread>maxSpread)return {action:"ABSTAIN",probability:p,confidence,uncertainty,spread};
 return {action:p>.5?"UP":"DOWN",probability:p,confidence,uncertainty,spread};
}
module.exports={decide};
