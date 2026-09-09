// V112100 regime-conditioned specialist selection.
const specialists=["catalyst","options","macro","technical","breadth","liquidity","news","risk","temporal","causal"];
function select(regimeScores={},regime="UNKNOWN"){
 const rows=specialists.map(id=>({id,score:Math.max(0,Math.min(100,Number(regimeScores?.[id]?.[regime]??50)))})).sort((a,b)=>b.score-a.score);
 return {version:"V112100",regime,priority:rows,top:rows.slice(0,5).map(x=>x.id)};
}
module.exports={specialists,select};