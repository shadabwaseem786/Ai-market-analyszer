// V477000 Causal-vs-Correlational Separation.
function classify(relations=[]){return relations.map(r=>({...r,class: r.interventionEvidence?"CAUSAL":"CORRELATIONAL"}));} module.exports={classify};