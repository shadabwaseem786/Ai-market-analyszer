// V21300: temperature scaling scaffold; calibration must fit on validation only.
function softmax(z,t=1){const x=z.map(v=>Math.exp(v/t)),s=x.reduce((a,b)=>a+b,0);return x.map(v=>v/s)}
function apply(logit,t=1){return 1/(1+Math.exp(-Math.max(-30,Math.min(30,logit/t))))}
module.exports={softmax,apply};
