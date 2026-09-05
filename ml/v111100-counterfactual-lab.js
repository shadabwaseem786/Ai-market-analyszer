// V111100 counterfactual scenario laboratory. Research-only.
function test(base={},counterfactual={}){
 const keys=[...new Set([...Object.keys(base),...Object.keys(counterfactual)])].filter(k=>Number.isFinite(Number(base[k]))&&Number.isFinite(Number(counterfactual[k])));
 const deltas=Object.fromEntries(keys.map(k=>[k,+(Number(counterfactual[k])-Number(base[k])).toFixed(3)]));
 const magnitude=keys.length?keys.reduce((s,k)=>s+Math.abs(deltas[k]),0)/keys.length:0;
 return {version:"V111100",deltas,magnitude:+magnitude.toFixed(3),counterfactualSensitivity:+Math.min(100,magnitude).toFixed(1),researchOnly:true};
}
module.exports={test};