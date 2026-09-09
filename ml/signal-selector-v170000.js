// V170000 selective prediction: rank only signals that survive quality gates.
export function selectSignalsV170(rows=[], limit=5){
  return rows.map(x=>({...x,_rank:rank(x)})).filter(x=>x._rank.tradeable).sort((a,b)=>b._rank.score-a._rank.score).slice(0,Math.max(1,limit));
}
function rank(x){
  const p=Number(x.probability??50), c=Number(x.confidence??x.agreement??0), r=Number(x.risk??100), q=Number(x.metaQuality??x.quality??0);
  const edge=Math.abs(p-50)*2;
  const score=Math.round(.35*edge+.25*c+.25*q+.15*(100-r));
  return {score,tradeable:q>=72&&c>=65&&r<=45&&(p>=68||p<=32)};
}
