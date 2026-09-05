// V129100 evidence weighting.
function weight(evidence=[]){
 return evidence.map(e=>{const quality=Math.max(0,Math.min(100,Number(e.quality??50))),freshness=Math.max(0,Math.min(100,Number(e.freshness??50))),independence=Math.max(0,Math.min(100,Number(e.independence??50)));return {...e,weight:+((quality*.4+freshness*.3+independence*.3)/100).toFixed(4)}})
}
module.exports={weight};