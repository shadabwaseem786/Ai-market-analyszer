// V108400 expected value / risk distribution for research.
function evaluate(outcomes=[]){
 const rows=outcomes.filter(x=>Number.isFinite(Number(x.probability))&&Number.isFinite(Number(x.return))).map(x=>({...x,probability:Number(x.probability)/100,return:Number(x.return)}));
 const total=rows.reduce((a,x)=>a+x.probability,0)||1;
 const ev=rows.reduce((s,x)=>s+x.probability/total*x.return,0);
 const variance=rows.reduce((s,x)=>s+x.probability/total*Math.pow(x.return-ev,2),0);
 return {version:"V108400",expectedValue:+ev.toFixed(3),volatility:+Math.sqrt(variance).toFixed(3),downside:rows.filter(x=>x.return<0).reduce((s,x)=>s+x.probability/total,0)*100,researchOnly:true};
}
module.exports={evaluate};