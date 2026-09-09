// V118400 expiry positioning research.
function assess(x={}){
 const d=Number(x.daysToExpiry)||30,pin=Number(x.pinRisk)||0,roll=Number(x.rollover)||0;
 return {version:"V118400",daysToExpiry:d,pinningRisk:+Math.min(100,pin).toFixed(1),rolloverPressure:+Math.min(100,Math.abs(roll)).toFixed(1),expiryRegime:d<=1?"EXPIRY_CRITICAL":d<=5?"EXPIRY_NEAR":"NORMAL"};
}
module.exports={assess};