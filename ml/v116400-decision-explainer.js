// V116400 decision explanation generator.
function explain(x={}){
 const top=Object.entries(x.dimensions||{}).sort((a,b)=>b[1]-a[1]).slice(0,3);
 const weak=Object.entries(x.dimensions||{}).sort((a,b)=>a[1]-b[1]).slice(0,3);
 return {version:"V116400",decision:x.decision||"ABSTAIN",strongestDrivers:top.map(([k,v])=>({dimension:k,score:v})),weakestDrivers:weak.map(([k,v])=>({dimension:k,score:v})),explanationMode:"AUDITABLE_SUMMARY"};
}
module.exports={explain};