// V20600: deterministic bounded hyperparameter grid. Selection must use OOS folds only.
function grid(){return [0.005,0.01,0.03,0.05].flatMap(lr=>[0.0001,0.001,0.01].map(l2=>({lr,l2})))}
function select(results){return [...results].filter(x=>Number.isFinite(x.oosScore)).sort((a,b)=>b.oosScore-a.oosScore)[0]||null}
module.exports={grid,select};
