// V123000 Regime-Switching Market Brain — research-only.
const REGIMES=["TREND_BULL","TREND_BEAR","RANGE","HIGH_VOL","LOW_VOL","EVENT_DRIVEN","GLOBAL_RISK_OFF","EXPIRY","LIQUIDITY_STRESS"];
function classify(x={}){
 const trend=Number(x.trend)||0,vol=Number(x.volatility)||50,global=Number(x.globalRisk)||50,expiry=Boolean(x.expiry),liq=Number(x.liquidity)||50,event=Number(x.eventIntensity)||0;
 let regime="RANGE"; if(liq<30)regime="LIQUIDITY_STRESS"; else if(expiry&&event>50)regime="EXPIRY"; else if(global>75)regime="GLOBAL_RISK_OFF"; else if(event>70)regime="EVENT_DRIVEN"; else if(vol>75)regime="HIGH_VOL"; else if(vol<25)regime="LOW_VOL"; else if(trend>60)regime="TREND_BULL"; else if(trend<-60)regime="TREND_BEAR";
 return {version:"V123000",regime,features:{trend,volatility:vol,globalRisk:global,expiry,liquidity:liq,eventIntensity:event},researchOnly:true};
}
module.exports={REGIMES,classify};