// V128100 prediction-error attribution.
function attribute(x={}){
 const weights={model:Number(x.modelContribution)||0,regime:Number(x.regimeContribution)||0,data:Number(x.dataContribution)||0,catalyst:Number(x.catalystContribution)||0,microstructure:Number(x.microstructureContribution)||0};
 const ranked=Object.entries(weights).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).map(([source,value])=>({source,value}));
 return {version:"V128100",primaryCause:ranked[0]?.source||"UNKNOWN",ranked};
}
module.exports={attribute};