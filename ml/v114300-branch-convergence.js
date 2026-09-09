// V114300 scenario convergence / dominant-future estimator.
function converge(scenarios=[]){
 const valid=scenarios.filter(x=>!x.invalidated&&Number(x.probability)>0).sort((a,b)=>b.probability-a.probability);
 const top=valid[0], second=valid[1];
 return {version:"V114300",activeBranches:valid.length,dominant:top?.id||null,dominantProbability:top?.probability||0,separation:top&&second?+(top.probability-second.probability).toFixed(2):100};
}
module.exports={converge};