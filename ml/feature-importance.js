// V21600: OOS feature importance contract.
function permutationImportance(base,shuffled){return shuffled.map(x=>({feature:x.feature,delta:(Number(base.score)||0)-(Number(x.score)||0)})).sort((a,b)=>b.delta-a.delta)}
module.exports={permutationImportance};
