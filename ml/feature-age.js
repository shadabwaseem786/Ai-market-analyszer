// V38600: feature freshness/staleness gate.
function check(ageMs,maxAgeMs){return{ageMs,maxAgeMs,fresh:Number(ageMs)<=Number(maxAgeMs)}}module.exports={check};