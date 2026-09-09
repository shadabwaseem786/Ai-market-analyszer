// V19600: conservative promotion rules.
function decision(metrics,{minSamples=500,minAccuracy=.53,minSharpe=.25,maxDrawdown=.15,maxCostDegradation=.30}={}){
 const reasons=[];
 if((metrics.samples||0)<minSamples)reasons.push("insufficient_oos_samples");
 if((metrics.accuracy||0)<minAccuracy)reasons.push("accuracy_gate");
 if((metrics.sharpe||0)<minSharpe)reasons.push("sharpe_gate");
 if((metrics.maxDrawdown||1)>maxDrawdown)reasons.push("drawdown_gate");
 if((metrics.costDegradation||1)>maxCostDegradation)reasons.push("cost_sensitivity_gate");
 return {status:reasons.length?"REJECT":"PROMOTE_CANDIDATE",reasons};
}
module.exports={decision};
