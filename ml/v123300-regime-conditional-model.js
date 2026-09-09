// V123300 selects model weights by regime.
function select(regime="RANGE",models={}){
 const chosen=models[regime]||models.DEFAULT||[];
 return {version:"V123300",regime,selectedModels:chosen,modelSelectionReason:"REGIME_CONDITIONAL"};
}
module.exports={select};