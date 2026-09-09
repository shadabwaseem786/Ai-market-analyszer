// V114100 scenario stress propagation.
function stress(scenarios=[],factors={}){
 return scenarios.map(s=>{let impact=0; for(const [k,v] of Object.entries(factors)){if(s.drivers?.includes(k))impact+=Math.abs(Number(v)||0)} return {...s,stressScore:+Math.min(100,impact).toFixed(1)}})
}
module.exports={stress};