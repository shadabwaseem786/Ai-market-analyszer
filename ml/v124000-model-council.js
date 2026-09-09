// V124000 Probabilistic Ensemble & Model Council — research-only.
const MODELS=["STATISTICAL","ML_TABULAR","TIME_SERIES","OPTIONS_MICROSTRUCTURE","CAUSAL","WORLD_MODEL","ANALOGUE","REGIME_MODEL","SENTIMENT","RULE_BASED"];
function calibrate(predictions=[]){
 return predictions.map(p=>({...p,probability:Math.max(0,Math.min(100,Number(p.probability)||50)),calibrationError:Math.max(0,Number(p.calibrationError)||0),robustness:Math.max(0,Math.min(100,Number(p.robustness)||0))}));
}
function ensemble(predictions=[],regime="RANGE"){
 const p=calibrate(predictions); if(!p.length)return {version:"V124000",status:"INSUFFICIENT"};
 const weighted=p.map(x=>{const regimeFit=Number(x.regimeFit?.[regime]??50);const w=Math.max(.01,(100-x.calibrationError)*.5+x.robustness*.3+regimeFit*.2);return {...x,weight:+w.toFixed(3)}});
 const sw=weighted.reduce((a,x)=>a+x.weight,0),prob=weighted.reduce((a,x)=>a+x.probability*x.weight,0)/sw;
 const disagreement=Math.sqrt(weighted.reduce((a,x)=>a+x.weight*(x.probability-prob)**2,0)/sw);
 return {version:"V124000",regime,modelCount:p.length,probability:+prob.toFixed(2),disagreement:+disagreement.toFixed(2),members:weighted,researchOnly:true};
}
module.exports={MODELS,calibrate,ensemble};