// V110000 Market Memory & Analog Engine. Research-only.
function distance(a={},b={},weights={}){
 const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>Number.isFinite(Number(a[k]))&&Number.isFinite(Number(b[k])));
 let s=0,w=0; for(const k of keys){const wt=Number(weights[k]??1),d=Math.abs(Number(a[k])-Number(b[k])); s+=wt*d; w+=wt}
 return w?s/w:100;
}
function find(current={},history=[],weights={}){
 const rows=history.map((h,i)=>({id:h.id||"A"+(i+1),distance:+distance(current,h.state||h,weights).toFixed(3),outcome:h.outcome??null,regime:h.regime??"UNKNOWN",catalyst:h.catalyst??"UNKNOWN"})).sort((a,b)=>a.distance-b.distance);
 const top=rows.slice(0,20), usable=top.filter(x=>x.outcome!==null);
 return {version:"V110000",matches:top,usableMatches:usable.length,analogueStrength:usable.length?+(100/(1+(usable.reduce((s,x)=>s+x.distance,0)/usable.length))).toFixed(2):0,researchOnly:true};
}
module.exports={distance,find};