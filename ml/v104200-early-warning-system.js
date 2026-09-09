// V104200 early-warning system for regime/catalyst deterioration.
function warnings(x={}){
 const w=[]; if(Number(x.dataHealth)<75)w.push("DATA_QUALITY"); if(Number(x.uncertainty)>55)w.push("UNCERTAINTY"); if(Number(x.liquidity)<40)w.push("LIQUIDITY"); if(Number(x.volatility)>75)w.push("VOLATILITY"); if(Number(x.agreement)<45)w.push("MODEL_DISAGREEMENT"); if(Number(x.catalystDecay)>70)w.push("CATALYST_DECAY");
 return {version:"V104200",warnings:w,severity:w.length>=3?"CRITICAL":w.length?"ELEVATED":"NORMAL",action:w.length?"WAIT/REVIEW":"CONTINUE_RESEARCH"};
}
module.exports={warnings};