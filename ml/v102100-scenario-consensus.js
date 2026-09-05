// V102100 multi-scenario consensus engine. Research-only.
function consensus(scenarios=[]){
 const rows=scenarios.filter(x=>Number.isFinite(Number(x.probability))).map(x=>({...x,probability:Math.max(0,Math.min(100,Number(x.probability)))}));
 const total=rows.reduce((a,x)=>a+x.probability,0)||1;
 const normalized=rows.map(x=>({...x,probability:+(x.probability/total*100).toFixed(1)}));
 const spread=normalized.length?Math.max(...normalized.map(x=>x.probability))-Math.min(...normalized.map(x=>x.probability)):100;
 return {version:"V102100",scenarios:normalized,consensusStrength:+Math.max(0,100-spread).toFixed(1),requiresScenarioCoverage:normalized.length>=3};
}
module.exports={consensus};