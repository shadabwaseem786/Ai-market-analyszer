// V130000 NEURAL MARKET TWIN — research architecture.
// Purpose: scenario testing, regime transitions, adversarial survival and abstention.
// This module intentionally does not claim 99.99% accuracy or manufacture missing live data.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function transitionProbability(regimeSignals){
  const vals=Object.values(regimeSignals||{}).map(Number).filter(Number.isFinite);
  if(!vals.length)return {transition:1,confidence:0};
  const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
  const dispersion=Math.sqrt(vals.reduce((s,v)=>s+(v-mean)**2,0)/vals.length);
  return {transition:clamp(dispersion/100),confidence:clamp(1-dispersion/100)};
}
function scenarioSet(base){
  const p=Number(base?.probability??50),u=Number(base?.uncertainty??50);
  return {bull:clamp((p+20-u*.1)/100),base:clamp(p/100),bear:clamp((100-p+u*.1)/100)};
}
module.exports={transitionProbability,scenarioSet};
