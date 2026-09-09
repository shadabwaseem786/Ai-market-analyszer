// V101300 decision provenance trace.
function trace(parts={}){
 const keys=Object.keys(parts), total=keys.reduce((s,k)=>s+Math.abs(Number(parts[k])||0),0)||1;
 return {version:"V101300",contributors:keys.map(k=>({factor:k,value:Number(parts[k])||0,share:+(Math.abs(Number(parts[k])||0)/total*100).toFixed(1)})),auditable:true};
}
module.exports={trace};