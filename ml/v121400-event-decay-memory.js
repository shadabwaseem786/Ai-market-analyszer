// V121400 time-aware catalyst memory.
function weight(item={},now=Date.now()){
 const age=Math.max(0,Number(item.ageMinutes)||0), half=Math.max(1,Number(item.halfLifeMinutes)||240);
 return {...item,memoryWeight:+(100*Math.pow(.5,age/half)).toFixed(2)};
}
module.exports={weight};