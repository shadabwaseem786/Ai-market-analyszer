// V108500 probability decision governor. Research-only.
function decide(x={}){
 const p=Number(x.probability)||50,u=Number(x.uncertainty)||100,cal=Number(x.calibrationError)||100,data=Number(x.dataHealth)||0;
 let decision="WAIT"; if(data<75||u>55||cal>20)decision="ABSTAIN";
 else if(p>=72&&u<=30)decision="BULLISH_WATCH"; else if(p<=28&&u<=30)decision="BEARISH_WATCH";
 return {version:"V108500",decision,probability:p,uncertainty:u,executionDisabled:true,humanReviewRequired:true};
}
module.exports={decide};