// V110300 memory conflict resolver. Research-only.
function resolve(memory={},model={}){
 const mp=Number(memory.probability), qp=Number(model.probability);
 if(!Number.isFinite(mp)||!Number.isFinite(qp))return {version:"V110300",status:"INSUFFICIENT"};
 const gap=Math.abs(mp-qp);
 return {version:"V110300",memoryProbability:mp,modelProbability:qp,gap:+gap.toFixed(2),status:gap<=10?"AGREE":gap<=25?"MIXED":"CONFLICT",requiresReview:gap>25};
}
module.exports={resolve};