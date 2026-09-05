// V102400 final conviction governor. Research-only; never emits trade orders.
function decide(x={}){
 const gates={data:Number(x.dataHealth)>=75,coverage:Number(x.coverage)>=70,uncertainty:Number(x.uncertainty)<=55,robustness:Number(x.robustness)>=60,adversarial:x.adversarial!=="REJECT_OR_WAIT",scenario:Boolean(x.scenarioCoverage)};
 const passed=Object.values(gates).filter(Boolean).length;
 let state="WAIT";
 if(passed<4)state="ABSTAIN";
 else if(passed===6&&Number(x.conviction)>=75)state="HIGH_CONVICTION_WATCH";
 else if(passed>=5)state="WATCH";
 return {version:"V102400",state,passedGates:passed,totalGates:6,gates,executionBlocked:true};
}
module.exports={decide};