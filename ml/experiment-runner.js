// V25500: deterministic experiment runner contract.
function run(config, folds, evaluator){return folds.map((fold,i)=>({fold:i,config,metrics:evaluator(fold,config)}))}module.exports={run};