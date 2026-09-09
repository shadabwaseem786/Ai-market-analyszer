// V108100 Bayesian-style sequential evidence updater. Research-only.
function update(prior=50,evidence=[]){
 let odds=(Number(prior)||50)/Math.max(1,100-(Number(prior)||50));
 for(const e of evidence){const lr=Math.max(.1,Math.min(10,Number(e.likelihoodRatio)||1)); odds*=lr}
 const posterior=100*odds/(1+odds);
 return {version:"V108100",prior:Number(prior)||50,posterior:+posterior.toFixed(2),evidenceCount:evidence.length,boundedLikelihood:true};
}
module.exports={update};