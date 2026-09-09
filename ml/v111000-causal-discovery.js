// V111000 Causal Discovery Lab — hypothesis graph, not causal proof. Research-only.
function discover(nodes=[],edges=[]){
 const graph=edges.map(e=>({from:e.from,to:e.to,confidence:Math.max(0,Math.min(100,Number(e.confidence)||0)),evidence:e.evidence||0}));
 const supported=graph.filter(e=>e.confidence>=60&&Number(e.evidence)>=2);
 return {version:"V111000",nodes,edges:graph,supportedEdges:supported.length,causalStatus:supported.length?"HYPOTHESIS_GRAPH":"INSUFFICIENT_EVIDENCE",causalityProven:false};
}
module.exports={discover};