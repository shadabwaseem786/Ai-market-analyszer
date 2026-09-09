// V118200 options positioning regime classifier.
function detect(x={}){
 const gamma=Number(x.gammaPressure)||0,iv=Number(x.ivExpansion)||0,pcr=Number(x.pcr)||1;
 let regime="BALANCED"; if(gamma>60&&iv>20)regime="GAMMA_VOLATILITY_RISK"; else if(iv>20)regime="VOL_EXPANSION"; else if(pcr>1.3)regime="PUT_HEAVY"; else if(pcr<.7)regime="CALL_HEAVY";
 return {version:"V118200",regime,confidence:+Math.min(100,50+Math.abs(pcr-1)*40+Math.abs(iv)).toFixed(1)};
}
module.exports={detect};