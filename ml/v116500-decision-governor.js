// V116500 final decision governor.
function govern(x={}){
 const gates={data:Number(x.dataQuality)>=75,calibration:Number(x.calibrationError)<=20,robustness:Number(x.robustness)>=65,uncertainty:Number(x.uncertainty)<=48,falsification:x.falsified!==true,humanReview:x.humanReview===true};
 return {version:"V116500",state:Object.values(gates).every(Boolean)?"DECISION_VALID":"DECISION_BLOCKED",gates,allowedOutputs:["ACTIVITY_BIAS","WAIT_WATCH","ABSTAIN"],executionDisabled:true,automaticTrading:false,automaticPromotion:false};
}
module.exports={govern};