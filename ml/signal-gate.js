// V20400: safety-aware live signal gate. Research signals only; never places orders.
function gate(signal,{minConfidence=.65,maxSpread=.15,allowedRegimes=["TREND_UP","TREND_DOWN","RANGE"]}={}){
 const reasons=[];
 if(!signal||!Number.isFinite(signal.probability))reasons.push("missing_probability");
 if((signal.confidence||0)<minConfidence)reasons.push("low_confidence");
 if((signal.spread||1)>maxSpread)reasons.push("model_disagreement");
 if(signal.regime&&!allowedRegimes.includes(signal.regime))reasons.push("regime_block");
 return {action:reasons.length?"NO_SIGNAL":"RESEARCH_SIGNAL",reasons,executionDisabled:true};
}
module.exports={gate};
