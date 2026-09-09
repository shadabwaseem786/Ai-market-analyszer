// V117300 stale/missing feature detection.
function audit(features={},required=[],maxAgeMs=120000){
 const missing=required.filter(k=>features[k]?.value==null), stale=required.filter(k=>features[k]?.value!=null&&features[k]?.ageMs!=null&&features[k].ageMs>maxAgeMs);
 return {version:"V117300",required:required.length,missing,stale,coverage:+((required.length-missing.length)/Math.max(1,required.length)*100).toFixed(1),status:missing.length||stale.length?"DEGRADED":"HEALTHY"};
}
module.exports={audit};