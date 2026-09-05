// V119200 cross-asset divergence detector.
function detect(expected=[],observed=[]){
 const map=Object.fromEntries(observed.map(x=>[x.id,Number(x.change)||0]));
 const out=expected.map(x=>{const e=Number(x.expected)||0,o=map[x.id]??0,d=o-e;return {id:x.id,expected:e,observed:o,deviation:+d.toFixed(3),divergent:Math.abs(d)>Number(x.threshold??1)}}).filter(x=>x.divergent);
 return {version:"V119200",divergences:out,count:out.length,severity:out.length>=3?"HIGH":out.length?"MEDIUM":"LOW"};
}
module.exports={detect};