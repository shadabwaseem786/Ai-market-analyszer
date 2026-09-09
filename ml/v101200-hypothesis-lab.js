// V101200 hypothesis generation/evaluation scaffold.
function hypotheses(state={}){
 const out=[];
 if((Number(state.catalystConfidence)||0)>=65)out.push({id:"H1",claim:"Catalyst persistence supports directional continuation",test:"Require independent confirmation and post-event decay check"});
 if((Number(state.agreement)||0)>=65)out.push({id:"H2",claim:"Cross-factor agreement supports signal robustness",test:"Run ablation and permutation challenge"});
 if((Number(state.risk)||50)>=65)out.push({id:"H3",claim:"Tail-risk regime may dominate directional edge",test:"Stress paths and require wider uncertainty band"});
 if(!out.length)out.push({id:"H0",claim:"No dominant hypothesis",test:"Remain WAIT and gather independent evidence"});
 return {version:"V101200",hypotheses:out,researchOnly:true};
}
module.exports={hypotheses};