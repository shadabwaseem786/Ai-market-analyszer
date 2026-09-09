// V121300 historical event analogue retrieval/scoring.
function match(event={},history=[]){
 return history.map(h=>{const type=h.type===event.type?40:0,regime=h.regime===event.regime?30:0,materiality=Math.max(0,30-Math.abs((Number(h.materiality)||0)-(Number(event.materiality)||0))*.3);return {...h,similarity:+Math.min(100,type+regime+materiality).toFixed(2)}}).sort((a,b)=>b.similarity-a.similarity).slice(0,10);
}
module.exports={match};