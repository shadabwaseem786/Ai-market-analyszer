// V70500: adversarial perturbation/stress research.
function run(predict,scenarios=[]){return scenarios.map(s=>({name:s.name,base:predict(s.base),stress:predict(s.stress)}))}module.exports={run};