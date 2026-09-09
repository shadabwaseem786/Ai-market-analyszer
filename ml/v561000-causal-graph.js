// V561000 Causal Graph Engine — research only.
function build(nodes=[],edges=[]){return {version:"V561000",nodes,edges:edges.map(e=>({...e,causal:true})),researchOnly:true};} module.exports={build};