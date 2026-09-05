// V107000 Quant Research Factory — governed experimentation. Research-only.
function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,Number(x)||0))}
function score(experiment={}){
 const oos=clamp(experiment.oos), cal=clamp(experiment.calibration), stability=clamp(experiment.stability);
 const overfit=clamp(experiment.overfitRisk), leakage=clamp(experiment.leakageRisk);
 const quality=clamp(oos*.35+cal*.25+stability*.20+(100-overfit)*.10+(100-leakage)*.10);
 return {version:"V107000",researchQuality:+quality.toFixed(1),eligible:quality>=70&&oos>=65&&cal>=65&&stability>=65&&overfit<=25&&leakage<=10,executionDisabled:true};
}
module.exports={score};