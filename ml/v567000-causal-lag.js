// V567000 Causal Lag Estimator.
function estimate(pairs=[]){return {version:"V567000",lags:pairs.map(p=>({...p,lag:Number(p.lag??0)})),researchOnly:true};} module.exports={estimate};