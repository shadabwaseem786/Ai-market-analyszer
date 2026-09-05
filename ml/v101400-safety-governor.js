// V101400 hard research safety governor.
function govern(x={}){
 const blocked=Boolean(x.executionRequested)||Boolean(x.brokerConnected)||Boolean(x.autoTrade);
 const gates=[x.dataHealth>=75,x.uncertainty<=60,x.robustness>=55,x.auditPassed!==false];
 const researchAllowed=gates.every(Boolean);
 return {version:"V101400",researchAllowed,executionBlocked:true,executionRequestedBlocked:blocked,automaticTrading:false,automaticPromotion:false,reason:blocked?"Execution path blocked":"Research governance evaluated"};
}
module.exports={govern};