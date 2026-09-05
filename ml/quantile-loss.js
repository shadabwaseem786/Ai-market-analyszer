// V35300: quantile forecast scoring contract.
function loss(y,q,p){return Math.max(p*(y-q),(p-1)*(y-q))}module.exports={loss};