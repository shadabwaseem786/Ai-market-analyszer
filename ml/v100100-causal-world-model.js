// V100100 Causal World Model scaffold. Research-only; no causal certainty is asserted.
function worldModel(f={}){
 const catalyst=Number(f.catalystConfidence)||0, agreement=Number(f.agreement)||50, risk=Number(f.risk)||50;
 const causalStrength=Math.max(0,Math.min(100,.45*catalyst+.35*agreement+.20*(100-risk)));
 const links=[
  {name:"Catalyst → Market",strength:Math.round(causalStrength)},
  {name:"Regime → Signal",strength:Math.round(Math.max(0,Math.min(100,agreement*.9)))},
  {name:"Risk → Outcome",strength:Math.round(Math.max(0,Math.min(100,100-risk)))}
 ];
 return {version:"V100100",links,causalConfidence:Math.round(causalStrength)};
}
module.exports={worldModel};