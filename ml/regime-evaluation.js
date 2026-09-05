// V20300: regime-sliced OOS evaluation.
function slice(predictions){
 const groups={TREND_UP:[],TREND_DOWN:[],RANGE:[],HIGH_VOL:[],LOW_VOL:[]};
 for(const p of predictions){const r=p.regime;if(groups[r])groups[r].push(p)}
 return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,{samples:v.length,accuracy:v.length?v.filter(x=>x.actual===x.predicted).length/v.length:null,meanReturn:v.length?v.reduce((s,x)=>s+(Number(x.netReturn)||0),0)/v.length:null}]));
}
module.exports={slice};
