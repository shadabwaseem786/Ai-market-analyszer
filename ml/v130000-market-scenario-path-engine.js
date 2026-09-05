// V130000 Market Scenario & Path Engine — research-only.
function build(base={},scenarios=[]){
 const paths=scenarios.map(s=>({id:s.id||"SCENARIO",label:s.label||"UNNAMED",probability:Math.max(0,Math.min(1,Number(s.probability)||0)),horizon:s.horizon||"UNSPECIFIED",triggers:s.triggers||[],invalidators:s.invalidators||[],targetZone:s.targetZone??null}));
 const total=paths.reduce((a,p)=>a+p.probability,0);
 return {version:"V130000",baseState:base,paths:paths.map(p=>({...p,normalizedProbability:total?+(p.probability/total).toFixed(5):0})),probabilityMass:+total.toFixed(5),researchOnly:true};
}
function transition(path={},state={}){
 const hit=(path.triggers||[]).filter(t=>String(state[t.key])===String(t.value)),bad=(path.invalidators||[]).filter(t=>String(state[t.key])===String(t.value));
 return {version:"V130000",active:bad.length===0&&hit.length>0,triggered:hit,invalidated:bad};
}
module.exports={build,transition};