// V102000 Market State Tensor — unified cross-domain state representation. Research-only.
function clamp(x){return Math.max(0,Math.min(100,Number(x)||0))}
function build(input={}){
 const domains=["price","breadth","options","macro","catalyst","news","regime","liquidity","risk"];
 const state=domains.map(d=>({domain:d,score:clamp(input[d]),quality:clamp(input[d+"Quality"]??input.dataHealth??50)}));
 const valid=state.filter(x=>x.quality>=60);
 const coherence=valid.length?valid.reduce((s,x)=>s+x.score,0)/valid.length:0;
 return {version:"V102000",state,coverage:+(valid.length/domains.length*100).toFixed(1),coherence:+coherence.toFixed(1),researchOnly:true};
}
module.exports={build};