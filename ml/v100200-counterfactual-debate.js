// V100200 Bull/Bear + counterfactual debate. Research-only.
function debate(f={}){
 const score=Number(f.score)||50, cat=Number(f.catalystConfidence)||50, risk=Number(f.risk)||50, data=Number(f.dataHealth)||50;
 const bull=score*.45+cat*.30+(100-risk)*.15+data*.10;
 const bear=(100-score)*.40+(100-cat)*.25+risk*.25+(100-data)*.10;
 const gap=Math.abs(bull-bear);
 const winner=gap<10?"TIED":bull>bear?"BULL":"BEAR";
 const counterfactual=winner==="BULL"?"If catalyst confirmation weakens, downgrade to WAIT.":winner==="BEAR"?"If risk compresses and breadth improves, downgrade bearish conviction to WAIT.":"If either evidence cluster breaks, remain WAIT.";
 return {version:"V100200",bull:+bull.toFixed(1),bear:+bear.toFixed(1),gap:+gap.toFixed(1),winner,counterfactual};
}
module.exports={debate};