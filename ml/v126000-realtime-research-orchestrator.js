// V126000 Real-Time Research Orchestrator — research-only.
const PRIORITIES=["CRITICAL","HIGH","MEDIUM","LOW"];
function detectChanges(previous={},current={}){
 const keys=new Set([...Object.keys(previous),...Object.keys(current)]),changes=[];
 for(const k of keys){const a=Number(previous[k])||0,b=Number(current[k])||0;if(a!==b)changes.push({key:k,delta:+(b-a).toFixed(6),magnitude:Math.abs(b-a)})}
 return changes.sort((a,b)=>b.magnitude-a.magnitude);
}
function prioritize(changes=[],thresholds={}){
 return changes.map(c=>{const t=Number(thresholds[c.key]??1);const ratio=c.magnitude/Math.max(t,1e-9);return {...c,priority:ratio>=5?"CRITICAL":ratio>=3?"HIGH":ratio>=1?"MEDIUM":"LOW"}})
}
function plan(changes=[]){
 const active=changes.filter(c=>c.priority!=="LOW").map(c=>c.key);
 return {version:"V126000",activeSignals:active,computeBudget:active.length>=5?"MAX":active.length>=2?"ELEVATED":"NORMAL",pipeline:["DATA_CHECK","CATALYST","MICROSTRUCTURE","CROSS_ASSET","REGIME","TEMPORAL","MODEL_COUNCIL","RED_TEAM","DECISION_GOVERNOR"],executionDisabled:true,automaticTrading:false,researchOnly:true};
}
module.exports={detectChanges,prioritize,plan};