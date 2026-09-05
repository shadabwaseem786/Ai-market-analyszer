// V20900: ensemble weighting from OOS evidence only.
function weights(models){const valid=models.filter(m=>Number.isFinite(m.oosSharpe)&&m.oosSharpe>0);const total=valid.reduce((s,m)=>s+m.oosSharpe,0);return Object.fromEntries(valid.map(m=>[m.id,total?m.oosSharpe/total:1/valid.length]))}
function blend(predictions,w){const xs=predictions.filter(x=>w[x.id]!=null);const z=xs.reduce((s,x)=>s+x.probability*w[x.id],0);return xs.length?z:null}
module.exports={weights,blend};
