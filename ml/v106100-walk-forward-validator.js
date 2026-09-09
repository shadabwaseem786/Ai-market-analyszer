// V106100 walk-forward validation coordinator. Research-only.
function validate(folds=[]){
 const valid=folds.filter(x=>Number.isFinite(Number(x.score)));
 if(valid.length<3)return {version:"V106100",status:"INSUFFICIENT_FOLDS",folds:valid.length,pass:false};
 const scores=valid.map(x=>Number(x.score)); const mean=scores.reduce((a,b)=>a+b,0)/scores.length;
 const min=Math.min(...scores); const stability=Math.max(0,100-(mean-min));
 return {version:"V106100",folds:valid.length,meanScore:+mean.toFixed(1),worstFold:+min.toFixed(1),stability:+stability.toFixed(1),pass:min>=60&&stability>=65};
}
module.exports={validate};