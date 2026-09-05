// V362000 Counterfactual Branch Generator.
function branch(base={},shocks=[]){return shocks.map((s,i)=>({id:"CF-"+(i+1),shock:s,state:{...base,...s},researchOnly:true}));} module.exports={branch};