// V108000 Probabilistic Market Brain — calibrated probabilistic research layer. NO trading.
function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,Number(x)||0))}
function brain(x={}){
 const base=clamp(x.baseProbability??50), regime=clamp(x.regimeProbability??base), catalyst=clamp(x.catalystProbability??base), options=clamp(x.optionsProbability??base), macro=clamp(x.macroProbability??base);
 const weights={base:.20,regime:.20,catalyst:.20,options:.20,macro:.20};
 const p=base*weights.base+regime*weights.regime+catalyst*weights.catalyst+options*weights.options+macro*weights.macro;
 const spread=Math.max(base,regime,catalyst,options,macro)-Math.min(base,regime,catalyst,options,macro);
 const uncertainty=clamp((100-(Number(x.dataHealth)||50))*.30+(Number(x.modelDisagreement)||spread)*.35+(Number(x.calibrationError)||10)*.35);
 return {version:"V108000",probability:+p.toFixed(2),uncertainty:+uncertainty.toFixed(2),confidence:+(100-uncertainty).toFixed(2),dispersion:+spread.toFixed(2),distribution:"CALIBRATED_ESTIMATE",executionDisabled:true};
}
module.exports={brain};