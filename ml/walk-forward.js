// V18700: reproducible purged walk-forward fold planner.
function folds(n,{train=10000,validate=2000,test=2000,horizon=60,embargo=60,step=2000}={}){
 const out=[];for(let testStart=train+validate;testStart<n;testStart+=step){
  const testEnd=Math.min(n,testStart+test),validateEnd=testStart,validateStart=Math.max(0,validateEnd-validate);
  const trainEnd=Math.max(0,validateStart-horizon-embargo),trainStart=Math.max(0,trainEnd-train);
  if(trainEnd>trainStart&&testEnd>testStart)out.push({train:[trainStart,trainEnd],validate:[validateStart,validateEnd],test:[testStart,testEnd],purge:horizon,embargo});
 }return out;
}
module.exports={folds};
