// V29900: lightweight audit payload canonicalization.
function payload(x){return JSON.stringify(x,Object.keys(x||{}).sort())}module.exports={payload};