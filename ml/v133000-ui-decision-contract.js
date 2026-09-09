// V133000 UI Decision Contract — preserves Newbie/Expert separation.
function contract(decision={},mode="NEWBIE"){
 const base={action:decision.action||"WAIT",confidence:Number(decision.confidence||0),risk:decision.risk||"UNKNOWN",timestamp:decision.timestamp||new Date().toISOString()};
 if(mode==="EXPERT")return {...base,mode:"EXPERT",score:decision.score??null,coverage:decision.coverage??null,conflicts:decision.conflicts??0,factors:decision.factors||{},drivers:decision.drivers||[],invalidators:decision.invalidators||[],models:decision.models||[]};
 return {...base,mode:"NEWBIE",message:decision.action==="BUY"?"Bullish evidence aligned":decision.action==="SELL"?"Bearish evidence aligned":decision.action==="ABSTAIN"?"Insufficient reliable evidence":"Evidence mixed or incomplete"};
}
module.exports={contract};