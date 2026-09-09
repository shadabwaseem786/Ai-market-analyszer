// V102200 adversarial reasoning challenge. Research-only.
function challenge(thesis={}){
 const attacks=[
  "catalyst is already priced in",
  "data timestamp/latency creates false causality",
  "regime transition invalidates historical analogues",
  "options positioning contradicts directional thesis",
  "liquidity/tail-risk overwhelms expected edge"
 ];
 const triggered=attacks.filter((_,i)=>[thesis.pricedIn,thesis.latencyRisk,thesis.regimeRisk,thesis.optionsConflict,thesis.tailRisk][i]);
 return {version:"V102200",attacks,triggered,attackCount:triggered.length,verdict:triggered.length>=3?"REJECT_OR_WAIT":triggered.length?"CAUTION":"PASS"};
}
module.exports={challenge};