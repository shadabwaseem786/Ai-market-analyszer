// V127200 historical replay scoring.
function score(replays=[]){
 const valid=replays.filter(x=>x.lookAheadSafe!==false), n=valid.length;
 const correct=valid.filter(x=>Boolean(x.correct)).length;
 const brier=n?valid.reduce((s,x)=>s+(Number(x.probability||.5)-Number(x.outcome||0))**2,0)/n:0;
 return {version:"V127200",samples:n,accuracy:n?+(100*correct/n).toFixed(2):0,brier:+brier.toFixed(5),researchOnly:true};
}
module.exports={score};