// V103100 regime-aware mixture-of-experts router. Research-only.
function route(state={}){
 const regime=String(state.regime||"UNKNOWN").toUpperCase();
 const experts=regime==="HIGH-VOL"?["tail-risk","volatility","options"]:regime==="TREND"?["trend","momentum","breadth"]:regime==="MEAN-REVERT"?["mean-reversion","liquidity","options"]:["ensemble","causal","macro"];
 return {version:"V103100",regime,experts,weights:experts.map((e,i)=>({expert:e,weight:+(1/experts.length).toFixed(3)})),router:"REGIME_CONDITIONAL",executionDisabled:true};
}
module.exports={route};