// V120400 catalyst transmission map.
function transmit(e={},channels=[]){
 return {version:"V120400",event:e.type||"UNEXPECTED",channels:channels.map(c=>({name:c.name||"UNKNOWN",sensitivity:Number(c.sensitivity)||0,observed:Number(c.observed)||0,transmission:+((Number(c.sensitivity)||0)*(Number(c.observed)||0)/100).toFixed(2)})),researchOnly:true};
}
module.exports={transmit};