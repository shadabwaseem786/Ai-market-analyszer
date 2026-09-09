// V122200 regime-conditioned temporal relationships.
function compare(groups={}){
 return {version:"V122200",regimes:Object.fromEntries(Object.entries(groups).map(([regime,links])=>[regime,{count:links.length,links:links.map(x=>({...x,stability:Number(x.stability)||0}))}]))};
}
module.exports={compare};