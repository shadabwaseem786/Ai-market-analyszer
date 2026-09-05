// V129200 thesis invalidation conditions.
function evaluate(thesis={},state={}){
 const invalidators=Array.isArray(thesis.invalidators)?thesis.invalidators:[], triggered=invalidators.filter(x=>x.key&&state[x.key]!==undefined&&String(state[x.key])===String(x.value));
 return {version:"V129200",invalidated:triggered.length>0,triggered};
}
module.exports={evaluate};