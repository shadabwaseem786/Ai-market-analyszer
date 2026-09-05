// V115200 bounded tail-shock stress laboratory.
function stress(base={},shocks=[]){
 return shocks.map((s,i)=>{const deltas=Object.fromEntries(Object.entries(s.delta||{}).map(([k,v])=>[k,Number(base[k]||0)+Number(v||0)])); return {id:s.id||"TAIL-"+(i+1),severity:Number(s.severity)||50,stressedState:deltas}});
}
module.exports={stress};