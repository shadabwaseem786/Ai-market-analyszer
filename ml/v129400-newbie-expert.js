// V129400 dual-mode decision presentation contract.
function render(decision={},mode="NEWBIE"){
 if(mode==="EXPERT")return {mode:"EXPERT",decision,showMatrix:true,showConflicts:true,showCoverage:true,showDrivers:true};
 return {mode:"NEWBIE",action:decision.action||"WAIT",confidence:decision.confidence||0,risk:decision.conflicts>2?"HIGH":"NORMAL",showMatrix:false};
}
module.exports={render};