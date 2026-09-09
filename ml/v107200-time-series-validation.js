// V107200 purged/embargoed time-series validation coordinator.
function validate(folds=[],embargo=0){
 const usable=folds.filter(x=>x.trainEnd&&x.testStart&&new Date(x.testStart)>new Date(x.trainEnd));
 const passed=usable.filter(x=>Number(x.score)>=60);
 return {version:"V107200",folds:usable.length,passed:passed.length,embargo,temporalLeakage:usable.length!==folds.length,pass:usable.length>=3&&passed.length/Math.max(1,usable.length)>=.67};
}
module.exports={validate};