// V121200 Catalyst transmission-path scorer.
function score(path=[]){
 const edges=path.map(x=>Math.max(0,Math.min(100,Number(x.strength)||0)));
 const cumulative=edges.length?edges.reduce((a,b)=>a*(b/100),1)*100:0;
 return {version:"V121200",edges:path.length,cumulativeStrength:+cumulative.toFixed(2),path,pathQuality:cumulative>=60?"STRONG":cumulative>=30?"MODERATE":"WEAK"};
}
module.exports={score};