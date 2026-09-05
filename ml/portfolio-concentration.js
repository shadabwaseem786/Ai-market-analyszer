// V37600: concentration/HHI risk diagnostic.
function hhi(weights){const a=Object.values(weights||{}).map(Number).filter(Number.isFinite);return a.reduce((s,x)=>s+x*x,0)}module.exports={hhi};