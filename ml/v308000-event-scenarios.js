// V308000 event-driven scenario generator.
function generate(event={},scenarios=[]){return scenarios.map((s,i)=>({id:i+1,event,...s,syntheticScenario:true}));} module.exports={generate};