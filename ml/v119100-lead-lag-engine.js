// V119100 lead-lag relationship engine.
function rank(links=[]){return {version:"V119100",ranked:[...links].sort((a,b)=>Math.abs(Number(b.leadLag)||0)-Math.abs(Number(a.leadLag)||0)).map(x=>({...x,leadLagStrength:+Math.min(100,Math.abs(Number(x.leadLag)||0)*10).toFixed(2)}))};}
module.exports={rank};