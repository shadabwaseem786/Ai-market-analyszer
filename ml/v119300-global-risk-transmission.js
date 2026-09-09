// V119300 global-to-India risk transmission map.
function score(x={}){
 const components=["US_INDICES","GLOBAL_VOL","USDINR","CRUDE","BOND_YIELDS","ASIA","FII_FLOW"];
 const vals=components.map(k=>Number(x[k])||0);
 const raw=vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.length);
 return {version:"V119300",transmissionScore:+Math.max(0,Math.min(100,50+raw)).toFixed(2),components:Object.fromEntries(components.map(k=>[k,Number(x[k])||0]))};
}
module.exports={score};