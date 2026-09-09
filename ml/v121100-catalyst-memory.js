// V121100 Catalyst Memory — stores regime-conditioned historical event patterns.
function remember(memory={},event={}){
 const key=[event.type||"UNKNOWN",event.regime||"UNKNOWN"].join("::"), prev=memory[key]||{count:0,meanReaction:0,meanLag:0};
 const n=prev.count+1, reaction=Number(event.reaction)||0, lag=Number(event.lagMinutes)||0;
 return {...memory,[key]:{count:n,meanReaction:+((prev.meanReaction*prev.count+reaction)/n).toFixed(3),meanLag:+((prev.meanLag*prev.count+lag)/n).toFixed(2)}};
}
module.exports={remember};