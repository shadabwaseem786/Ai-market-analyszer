// V125200 regime-stratified validation.
function evaluate(records=[]){
 const groups={}; for(const r of records){const k=r.regime||"UNKNOWN";(groups[k]??=[]).push(r)}
 return {version:"V125200",regimes:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,{samples:v.length,accuracy:+(100*v.filter(x=>Boolean(x.correct)).length/Math.max(1,v.length)).toFixed(2)}]))};
}
module.exports={evaluate};