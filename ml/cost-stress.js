// V20100: robustness across transaction-cost/slippage scenarios.
function stress(result, multipliers=[.5,1,2,3]){
 return multipliers.map(mult=>({...result,costMultiplier:mult,robustNetReturn:(Number(result.netReturn)||0)-Math.abs(Number(result.cost)||0)*(mult-1)}));
}
function degradation(base,stressed){return base?1-(Number(stressed)/Number(base)):null}
module.exports={stress,degradation};
