// V124400 ensemble abstention when disagreement/uncertainty is excessive.
function decide(x={}){
 const disagreement=Number(x.disagreement)||100,uncertainty=Number(x.uncertainty)||100,models=Number(x.modelCount)||0;
 return {version:"V124400",abstain:models<3||disagreement>30||uncertainty>50,reason:models<3?"TOO_FEW_MODELS":disagreement>30?"MODEL_DISAGREEMENT":"HIGH_UNCERTAINTY"};
}
module.exports={decide};