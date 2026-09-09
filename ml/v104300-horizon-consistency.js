// V104300 multi-horizon consistency validator.
function validate(horizons={}){
 const vals=Object.values(horizons).map(Number).filter(Number.isFinite); if(!vals.length)return {version:"V104300",consistency:0,status:"INSUFFICIENT"};
 const spread=Math.max(...vals)-Math.min(...vals); return {version:"V104300",consistency:+Math.max(0,100-spread).toFixed(1),spread:+spread.toFixed(1),status:spread<=15?"ALIGNED":spread<=30?"MIXED":"CONFLICTED"};
}
module.exports={validate};