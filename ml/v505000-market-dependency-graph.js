// V505000 Market Dependency Graph.
function build(nodes=[],edges=[]){return {version:"V505000",nodes,edges:edges.map(e=>({...e,dependency:true})),researchOnly:true};} module.exports={build};