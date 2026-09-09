// V19400: configurable India F&O research cost model. Values are parameters, not broker quotes.
function estimate({turnover=0,brokerage=0,stt=0,exchange=0,sebi=0,gst=0,stamp=0,slippageBps=0}={}){
 const t=Number(turnover)||0, slip=t*(Number(slippageBps)||0)/10000;
 const fees=t*(Number(brokerage)+Number(stt)+Number(exchange)+Number(sebi)+Number(gst)+Number(stamp))/100;
 return {turnover:t,brokerage:brokerage*t/100,stt:stt*t/100,exchange:exchange*t/100,sebi:sebi*t/100,gst:gst*t/100,stamp:stamp*t/100,slippage:slip,total:fees+slip};
}
function stress(base,multipliers=[.5,1,2,3]){return multipliers.map(x=>({...base,slippageBps:(Number(base.slippageBps)||0)*x,multiplier:x}))}
module.exports={estimate,stress};
