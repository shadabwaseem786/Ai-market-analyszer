// V106400 controlled challenger generator. Research-only.
const families=["trend","mean-reversion","volatility","options","macro","catalyst","ensemble","causal"];
function generate(context={}){
 return families.map((family,i)=>({id:"CH-"+(i+1),family,objective:"challenge incumbent under current regime",constraints:{oosRequired:true,calibrationRequired:true,stabilityRequired:true,executionDisabled:true}}));
}
module.exports={families,generate};