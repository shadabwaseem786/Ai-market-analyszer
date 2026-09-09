// V109400 temporal cross-horizon consistency.
function compare(horizons={}){
 const vals=Object.values(horizons).map(Number).filter(Number.isFinite); if(vals.length<2)return {version:"V109400",status:"INSUFFICIENT"};
 const spread=Math.max(...vals)-Math.min(...vals);
 return {version:"V109400",spread:+spread.toFixed(2),consistency:+Math.max(0,100-spread).toFixed(2),status:spread<=10?"ALIGNED":spread<=25?"MIXED":"CONFLICTED"};
}
module.exports={compare};