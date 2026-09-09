// V131000 Uncertainty & Risk Intelligence Engine — analytical risk, not trade execution.
function analyze(x={}){
 const inputs=["modelDisagreement","dataRisk","regimeRisk","eventRisk","liquidityRisk","tailRisk"].map(k=>Math.max(0,Math.min(100,Number(x[k]??0))));
 const uncertainty=inputs.reduce((a,b)=>a+b,0)/Math.max(1,inputs.length);
 const confidence=Math.max(0,100-uncertainty);
 return {version:"V131000",uncertainty:+uncertainty.toFixed(2),confidence:+confidence.toFixed(2),riskBand:uncertainty>=70?"EXTREME":uncertainty>=50?"HIGH":uncertainty>=30?"MODERATE":"LOW",components:Object.fromEntries(["modelDisagreement","dataRisk","regimeRisk","eventRisk","liquidityRisk","tailRisk"].map((k,i)=>[k,inputs[i]])),researchOnly:true};
}
module.exports={analyze};