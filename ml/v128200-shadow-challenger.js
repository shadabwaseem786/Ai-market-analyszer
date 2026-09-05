// V128200 shadow challenger models; never auto-promoted.
function compare(champion={},challenger={},metric="brier"){
 const a=Number(champion[metric]),b=Number(challenger[metric]),better=Number.isFinite(a)&&Number.isFinite(b)?b<a:false;
 return {version:"V128200",metric,champion:a,challenger:b,challengerBetter:better,shadowOnly:true,automaticPromotion:false};
}
module.exports={compare};