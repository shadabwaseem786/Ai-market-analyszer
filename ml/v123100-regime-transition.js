// V123100 regime transition detector.
function detect(history=[]){
 const changes=[]; for(let i=1;i<history.length;i++)if(history[i].regime!==history[i-1].regime)changes.push({from:history[i-1].regime,to:history[i].regime,timestamp:history[i].timestamp||null});
 const latest=changes.at(-1)||null;
 return {version:"V123100",transitionCount:changes.length,latestTransition:latest,transitionDetected:Boolean(latest)};
}
module.exports={detect};