// V125500 model promotion gate — no automatic deployment/trading.
function govern(x={}){
 const gates={oos:Number(x.oosAccuracy)>=55,calibration:Number(x.brier)<=.25,sampleSize:Number(x.sampleSize)>=100,drawdown:Number(x.maxDrawdown)<=35,stability:Number(x.stability)>=60,noLeakage:x.noLeakage===true};
 return {version:"V125500",state:Object.values(gates).every(Boolean)?"VALIDATION_PASS":"VALIDATION_FAIL",gates,automaticPromotion:false,automaticTrading:false,executionDisabled:true};
}
module.exports={govern};