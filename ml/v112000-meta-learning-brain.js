// V112000 Meta-Learning Brain — learns which research specialist is reliable by regime. Research-only.
function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,Number(x)||0))}
function rank(models=[],regime="UNKNOWN"){
 const rows=models.map(m=>{const r=m.regimeScores?.[regime]; const score=Number.isFinite(Number(r))?Number(r):Number(m.globalScore)||50; return {...m,regime,metaScore:+clamp(score).toFixed(2)}}).sort((a,b)=>b.metaScore-a.metaScore);
 return {version:"V112000",regime,ranked:rows,selected:rows[0]?.id||null,automaticPromotion:false,researchOnly:true};
}
module.exports={rank};