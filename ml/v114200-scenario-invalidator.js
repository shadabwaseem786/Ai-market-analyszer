// V114200 scenario invalidation monitor.
function check(scenarios=[],observed={}){
 return scenarios.map(s=>{const invalid=s.invalidators||[]; const hits=invalid.filter(k=>Number(observed[k])>0); return {...s,invalidated:hits.length>0,invalidatorsHit:hits}})
}
module.exports={check};