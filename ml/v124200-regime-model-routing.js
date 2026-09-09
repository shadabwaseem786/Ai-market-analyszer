// V124200 regime-aware model routing.
function route(regime,models=[]){
 return {version:"V124200",regime,active:models.filter(m=>!m.regimes||m.regimes.includes(regime)).map(m=>m.name),excluded:models.filter(m=>m.regimes&&!m.regimes.includes(regime)).map(m=>m.name)};
}
module.exports={route};