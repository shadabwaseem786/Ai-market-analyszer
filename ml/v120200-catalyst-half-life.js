// V120200 catalyst decay / half-life estimator.
function decay(x={}){
 const age=Number(x.ageMinutes)||0, half=Math.max(1,Number(x.halfLifeMinutes)||240), remaining=100*Math.pow(.5,age/half);
 return {version:"V120200",ageMinutes:age,halfLifeMinutes:half,remainingImpact:+remaining.toFixed(2),state:remaining>=60?"FRESH":remaining>=25?"DECAYING":"STALE"};
}
module.exports={decay};