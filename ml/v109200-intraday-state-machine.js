// V109200 intraday market state machine.
const STATES=["PREOPEN","OPENING","TRENDING","BALANCED","VOLATILE","CLOSING","CLOSED"];
function transition(prev="PREOPEN",signals={}){
 const vol=Number(signals.volatility)||50, trend=Math.abs(Number(signals.trend)||0), hour=Number(signals.hour);
 let state=prev;
 if(hour<9)state="PREOPEN"; else if(hour<10)state=vol>70?"VOLATILE":"OPENING"; else if(hour>=15)state="CLOSING"; else if(vol>75)state="VOLATILE"; else if(trend>60)state="TRENDING"; else state="BALANCED";
 return {version:"V109200",previous:prev,state,validStates:STATES};
}
module.exports={STATES,transition};