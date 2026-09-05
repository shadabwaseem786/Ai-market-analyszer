// V116100 explicit three-way research decision.
function decide(x={}){
 const q=Number(x.decisionQuality)||0,p=Number(x.probability)||0,r=Number(x.robustness)||0;
 let decision="ABSTAIN"; if(q>=72&&p>=65&&r>=65)decision="ACTIVITY_BIAS"; else if(q>=52&&p>=50)decision="WAIT_WATCH";
 return {version:"V116100",decision,probability:p,quality:q,robustness:r,reason:decision==="ACTIVITY_BIAS"?"Convergent evidence":"Insufficient convergence for directional conviction"};
}
module.exports={decide};