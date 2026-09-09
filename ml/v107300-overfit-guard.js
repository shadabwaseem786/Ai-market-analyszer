// V107300 multiple-testing/backtest overfit guard.
function assess(x={}){
 const tests=Number(x.tests)||0, best=Number(x.bestScore)||0, median=Number(x.medianScore)||0;
 const optimism=Math.max(0,best-median);
 const risk=Math.min(100,optimism*2+Math.max(0,tests-20)*1.5);
 return {version:"V107300",tests,optimism:+optimism.toFixed(2),overfitRisk:+risk.toFixed(1),status:risk>35?"HIGH":risk>20?"MEDIUM":"LOW",researchOnly:true};
}
module.exports={assess};