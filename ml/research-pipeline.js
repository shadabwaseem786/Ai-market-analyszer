// V19900: end-to-end research pipeline orchestrator.
const {qualityReport}=require("./data-quality");
const {build}=require("./feature-factory");
const {buildMultiHorizon}=require("./labels");
const {folds}=require("./walk-forward");
const {run}=require("./walk-forward-runner");
const {rank}=require("./leaderboard");
function prepare(rows){
 const quality=qualityReport(rows), features=build(rows);
 const labels=buildMultiHorizon(rows,{costBps:8,slippageBps:2});
 return {quality,features,labels};
}
function research(rows,opts={}){
 const prepared=prepare(rows);
 if(!prepared.quality.ready)return {version:"V19900",status:"BLOCKED_DATA_QUALITY",quality:prepared.quality};
 const baseline=run(rows,{train:opts.train||10000,validate:opts.validate||2000,test:opts.test||2000,horizon:opts.horizon||30,embargo:opts.embargo||60,step:opts.step||2000});
 return {version:"V19900",status:"RESEARCH_COMPLETE",quality:prepared.quality,baseline,foldCount:folds(rows.length,opts).length,leaderboard:rank(baseline.folds||[])};
}
module.exports={prepare,research};
