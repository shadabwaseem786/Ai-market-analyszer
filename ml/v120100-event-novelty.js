// V120100 event novelty and information surprise.
function novelty(e={},history=[]){
 const prior=history.filter(x=>x.topic===e.topic).map(x=>Number(x.similarity)||0); const similarity=prior.length?Math.max(...prior):0;
 return {version:"V120100",novelty:+(100-similarity).toFixed(2),historicalMatches:prior.length,informationNovelty:similarity<30?"HIGH":similarity<60?"MEDIUM":"LOW"};
}
module.exports={novelty};