// V104100 cross-asset shock propagation graph.
function propagate(nodes=[],edges=[],shock={}){
 const score={...shock}; for(const e of edges){const a=Number(score[e.from]||0), beta=Number(e.beta)||0; score[e.to]=(Number(score[e.to]||0)+a*beta)}
 return {version:"V104100",propagated:Object.fromEntries(Object.entries(score).map(([k,v])=>[k,+Number(v).toFixed(2)])),iterations:1,researchOnly:true};
}
module.exports={propagate};