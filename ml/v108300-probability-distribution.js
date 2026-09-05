// V108300 scenario probability distribution.
function distribution(scenarios=[]){
 const rows=scenarios.filter(x=>Number.isFinite(Number(x.weight))).map(x=>({...x,weight:Math.max(0,Number(x.weight))}));
 const total=rows.reduce((a,b)=>a+b.weight,0)||1;
 return {version:"V108300",scenarios:rows.map(x=>({...x,probability:+(x.weight/total*100).toFixed(2)})),normalized:true};
}
module.exports={distribution};