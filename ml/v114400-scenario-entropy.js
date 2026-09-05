// V114400 scenario entropy — uncertainty across futures.
function entropy(scenarios=[]){
 const ps=scenarios.map(x=>Number(x.probability)/100).filter(p=>p>0);
 const h=-ps.reduce((s,p)=>s+p*Math.log2(p),0), max=Math.log2(Math.max(1,ps.length));
 return {version:"V114400",entropy:+h.toFixed(3),normalizedEntropy:max?+(h/max).toFixed(3):0,uncertaintyBand:h/max>.75?"HIGH":h/max>.45?"MEDIUM":"LOW"};
}
module.exports={entropy};