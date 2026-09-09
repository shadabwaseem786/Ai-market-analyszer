// V111200 causal robustness / invariance checks.
function assess(samples=[]){
 const vals=samples.map(x=>Number(x.effect)).filter(Number.isFinite); if(vals.length<3)return {version:"V111200",status:"INSUFFICIENT"};
 const mean=vals.reduce((a,b)=>a+b,0)/vals.length, spread=Math.max(...vals)-Math.min(...vals);
 return {version:"V111200",samples:vals.length,meanEffect:+mean.toFixed(3),spread:+spread.toFixed(3),invariance:+Math.max(0,100-spread).toFixed(1),status:spread<=10?"ROBUST":spread<=25?"MIXED":"FRAGILE"};
}
module.exports={assess};