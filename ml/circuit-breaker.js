// V21000: circuit breaker for degraded live/research signals.
function check({accuracy,sharpe,drawdown,psi,staleMinutes},{minAccuracy=.50,minSharpe=-.10,maxDrawdown=.20,maxPsi=.25,maxStaleMinutes=10}={}){
 const reasons=[];if(Number.isFinite(accuracy)&&accuracy<minAccuracy)reasons.push("accuracy_degraded");if(Number.isFinite(sharpe)&&sharpe<minSharpe)reasons.push("sharpe_degraded");if(Number.isFinite(drawdown)&&drawdown>maxDrawdown)reasons.push("drawdown_breach");if(Number.isFinite(psi)&&psi>maxPsi)reasons.push("feature_drift");if(Number.isFinite(staleMinutes)&&staleMinutes>maxStaleMinutes)reasons.push("stale_data");return {halt:reasons.length>0,reasons};
}
module.exports={check};
