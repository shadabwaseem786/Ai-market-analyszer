// V119400 cross-asset regime classifier.
function detect(x={}){
 const s=Number(x.transmissionScore)||50,d=Number(x.divergences)||0;
 let regime="CROSS_ASSET_BALANCED"; if(s>=70&&d>=3)regime="GLOBAL_RISK_ON_STRESS"; else if(s<=30&&d>=3)regime="GLOBAL_RISK_OFF_STRESS"; else if(d>=3)regime="CROSS_ASSET_DISLOCATION";
 return {version:"V119400",regime,confidence:+Math.max(0,100-Math.abs(s-50)*.7).toFixed(1)};
}
module.exports={detect};