// V148000 Continuous Benchmarking.
function compare(predictions=[],baselines=[]){const avg=a=>a.length?a.reduce((s,x)=>s+Number(x.score||0),0)/a.length:0;return {version:"V148000",modelScore:+avg(predictions).toFixed(4),baselineScores:baselines.map(b=>({name:b.name,score:+avg(b.predictions||[]).toFixed(4)})),researchOnly:true};}
module.exports={compare};