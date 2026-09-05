// V19200: regime-conditioned evaluation and stress testing.
function byRegime(predictions){
 const out={};for(const p of predictions||[]){const k=p.regime||"UNKNOWN";(out[k]??=[]).push(p)}return out;
}
function stress(predictions,multipliers=[.5,1,2,3]){
 return multipliers.map(m=>{const r=(predictions||[]).map(p=>(Number(p.netReturn)||0)*m);let eq=1,peak=1,dd=0;for(const x of r){eq*=1+x;peak=Math.max(peak,eq);dd=Math.max(dd,(peak-eq)/peak)}return {costMultiplier:m,totalReturn:eq-1,maxDrawdown:dd,samples:r.length}})}
module.exports={byRegime,stress};
