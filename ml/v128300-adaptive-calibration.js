// V128300 bounded online calibration update.
function update(prior=0.5,observed=0,rate=0.05){
 const p=Math.max(0,Math.min(1,Number(prior))),y=Number(observed)?1:0,r=Math.max(0,Math.min(.1,Number(rate)));
 return {version:"V128300",prior:p,observed:y,updated:+(p+r*(y-p)).toFixed(5),boundedRate:r};
}
module.exports={update};