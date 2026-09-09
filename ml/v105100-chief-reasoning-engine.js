// V105100 Chief Reasoning Engine — debate, synthesis, abstention. Research-only.
function synthesize(hive={},debate={},twin={},warnings={}){
 const coverage=Number(hive.coverage)||0, consensus=Number(hive.consensus)||50, disagreement=Number(hive.disagreement)||100;
 const stress=twin?.scenarios?.length?Math.max(...twin.scenarios.map(x=>Number(x.stress)||0)):50;
 const warningPenalty=warnings.severity==="CRITICAL"?30:warnings.severity==="ELEVATED"?10:0;
 const conviction=Math.max(0,Math.min(100,consensus-(disagreement*.35)-(stress*.15)-warningPenalty));
 let decision="ABSTAIN"; if(coverage>=70&&disagreement<=25&&warnings.severity!=="CRITICAL"){decision=conviction>=72?"HIGH_CONVICTION_WATCH":conviction>=55?"WATCH":"WAIT";}
 return {version:"V105100",decision,conviction:+conviction.toFixed(1),rationale:{coverage,disagreement,stress,warningPenalty},executionDisabled:true};
}
module.exports={synthesize};