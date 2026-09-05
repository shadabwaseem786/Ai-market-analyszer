// V110100 regime/catalyst conditioned analogue weighting.
function weight(analogues=[],current={}){
 return analogues.map(a=>{const regime=String(a.regime||"")===String(current.regime||""); const catalyst=String(a.catalyst||"")===String(current.catalyst||""); const w=(regime?1.5:1)*(catalyst?1.5:1)/(1+Math.max(0,Number(a.distance)||0)); return {...a,conditionalWeight:+w.toFixed(6)}}).sort((a,b)=>b.conditionalWeight-a.conditionalWeight);
}
module.exports={weight};