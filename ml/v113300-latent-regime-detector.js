// V113300 latent regime detector.
function detect(state={}){
 const v=Number(state.volatility)||50, t=Number(state.priceTrend??state.price)||50, l=Number(state.liquidity)||50;
 let regime="BALANCED"; if(v>75&&l<45)regime="STRESSED"; else if(v>70)regime="HIGH_VOL"; else if(t>70)regime="BULL_TREND"; else if(t<30)regime="BEAR_TREND"; else if(l<40)regime="ILLIQUID";
 return {version:"V113300",regime,latentConfidence:+Math.max(0,100-Math.abs(v-50)*.5-Math.abs(l-50)*.3).toFixed(1)};
}
module.exports={detect};