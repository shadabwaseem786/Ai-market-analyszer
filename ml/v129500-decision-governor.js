// V129500 final F&O decision governor.
function govern(x={}){
 const gates={data:Number(x.dataQuality)>=75,coverage:Number(x.coverage)>=70,confidence:Number(x.confidence)>=65,conflicts:Number(x.conflicts||0)<=3,regime:x.regimeKnown!==false,validation:x.validationPass===true,redTeam:Number(x.redTeam)>=65,thesisValid:x.thesisInvalidated!==true};
 const state=Object.values(gates).every(Boolean)?"DECISION_VALID":"WAIT_ABSTAIN";
 return {version:"V129500",state,gates,executionDisabled:true,automaticTrading:false,automaticPromotion:false};
}
module.exports={govern};