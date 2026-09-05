// V118300 F&O divergence detector.
function detect(x={}){
 const divergences=[];
 if(Math.sign(Number(x.priceChange)||0)!==Math.sign(Number(x.oiChange)||0)&&Number(x.priceChange)!==0&&Number(x.oiChange)!==0)divergences.push("PRICE_OI_DIVERGENCE");
 if(Math.abs(Number(x.spotFuturesBasisChange)||0)>Number(x.basisThreshold||1))divergences.push("BASIS_DIVERGENCE");
 if(Math.abs(Number(x.ivChange)||0)>Number(x.ivThreshold||10))divergences.push("IV_DIVERGENCE");
 return {version:"V118300",divergences,severity:divergences.length>=2?"HIGH":divergences.length?"MEDIUM":"LOW"};
}
module.exports={detect};