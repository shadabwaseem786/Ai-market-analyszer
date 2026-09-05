// V113400 consistency checks between world model and observed state.
function check(predicted={},observed={}){
 const keys=[...new Set([...Object.keys(predicted),...Object.keys(observed)])];
 const errors=keys.filter(k=>Number.isFinite(Number(predicted[k]))&&Number.isFinite(Number(observed[k]))).map(k=>Math.abs(Number(predicted[k])-Number(observed[k])));
 const mae=errors.length?errors.reduce((a,b)=>a+b,0)/errors.length:100;
 return {version:"V113400",dimensions:errors.length,mae:+mae.toFixed(3),status:mae<=5?"ALIGNED":mae<=15?"DRIFTING":"MISALIGNED"};
}
module.exports={check};