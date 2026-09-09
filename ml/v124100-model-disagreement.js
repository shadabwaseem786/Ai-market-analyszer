// V124100 model disagreement analyzer.
function analyze(models=[]){
 if(!models.length)return {version:"V124100",state:"INSUFFICIENT"};
 const probs=models.map(x=>Number(x.probability)||50),mean=probs.reduce((a,b)=>a+b,0)/probs.length;
 const spread=Math.max(...probs)-Math.min(...probs);
 return {version:"V124100",mean:+mean.toFixed(2),spread:+spread.toFixed(2),state:spread>=35?"HIGH_DISAGREEMENT":spread>=18?"MODERATE_DISAGREEMENT":"CONVERGENT"};
}
module.exports={analyze};