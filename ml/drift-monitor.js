// V18900: feature drift monitor using PSI-style bin comparison.
function psi(expected,actual,bins=10){
 if(!expected?.length||!actual?.length)return null;
 const vals=[...expected,...actual].filter(Number.isFinite),lo=Math.min(...vals),hi=Math.max(...vals)||lo+1;
 let total=0;for(let i=0;i<bins;i++){const a=expected.filter(x=>x<=lo+(hi-lo)*(i+1)/bins&&x>=lo+(hi-lo)*i/bins).length/expected.length+.0001;const b=actual.filter(x=>x<=lo+(hi-lo)*(i+1)/bins&&x>=lo+(hi-lo)*i/bins).length/actual.length+.0001;total+=(b-a)*Math.log(b/a)}
 return total;
}
function status(score){return score==null?"UNKNOWN":score<.1?"LOW":score<.25?"MEDIUM":"HIGH"}
module.exports={psi,status};
