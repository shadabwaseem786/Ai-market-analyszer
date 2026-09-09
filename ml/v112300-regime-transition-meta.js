// V112300 transition-aware meta learning.
function blend(current={},next={},transitionProbability=0){
 const p=Math.max(0,Math.min(1,Number(transitionProbability)||0));
 const keys=[...new Set([...Object.keys(current),...Object.keys(next)])];
 const blended=Object.fromEntries(keys.map(k=>[k,+((Number(current[k]??50)*(1-p))+(Number(next[k]??50)*p)).toFixed(2)]));
 return {version:"V112300",transitionProbability:p,blended};
}
module.exports={blend};