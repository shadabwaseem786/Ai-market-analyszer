// V20500: feature ablation planning for OOS research.
function groups(){return {momentum:["return5","return15","return30"],volatility:["volatility20","volatility60"],trend:["ema20Gap","ema50Gap"],flow:["volumeZ","openInterest"],range:["rangePosition"]}}
function plans(){const g=groups(),all=Object.values(g).flat();return [{name:"ALL",features:all},...Object.keys(g).map(k=>({name:"NO_"+k.toUpperCase(),features:all.filter(x=>!g[k].includes(x))}))]}
module.exports={groups,plans};
