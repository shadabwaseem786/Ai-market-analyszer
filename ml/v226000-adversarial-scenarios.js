// V226000 Adversarial Scenario Generator.
function generate(base={},attacks=[]){return attacks.map((a,i)=>({...base,scenarioId:i+1,attack:a,adversarial:true}));} module.exports={generate};