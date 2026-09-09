// V143000 Intraday Market State Machine.
const STATES=["PRE_OPEN","OPENING","TREND","CONSOLIDATION","BREAKOUT","REVERSAL","CLOSE"];
function next(current="PRE_OPEN",x={}){const v=Number(x.momentum||0),range=Number(x.rangeExpansion||0);let state=current;if(current==="PRE_OPEN")state="OPENING";else if(range>70&&Math.abs(v)>40)state=v>0?"BREAKOUT":"REVERSAL";else if(Math.abs(v)<15)state="CONSOLIDATION";else if(Math.abs(v)>35)state="TREND";return {version:"V143000",previous:current,state,confidence:Math.min(100,50+Math.abs(v)*.4+range*.1),researchOnly:true};}
module.exports={STATES,next};