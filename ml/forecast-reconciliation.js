// V40900: multi-horizon forecast reconciliation.
function reconcile(values){const a=values.filter(Number.isFinite);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null}module.exports={reconcile};