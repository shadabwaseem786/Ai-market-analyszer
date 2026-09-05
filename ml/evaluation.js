// V18400: robustness metrics and model promotion gates.
function stats(values){const a=values.filter(Number.isFinite),n=a.length;if(!n)return {n:0,mean:0,sd:0};const m=a.reduce((s,x)=>s+x,0)/n,sd=Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/Math.max(1,n-1));return {n,mean:m,sd}}
function evaluate(predictions){
 const v=predictions.filter(x=>x&&x.actual&&x.predicted), correct=v.filter(x=>x.actual===x.predicted).length;
 const r=v.map(x=>Number(x.netReturn)).filter(Number.isFinite);let eq=1,peak=1,dd=0;
 for(const x of r){eq*=1+x;peak=Math.max(peak,eq);dd=Math.max(dd,(peak-eq)/peak)}
 const st=stats(r),sh=st.sd?st.mean/st.sd*Math.sqrt(252*6.25):0;
 return {samples:v.length,accuracy:v.length?correct/v.length:0,totalNetReturn:eq-1,maxDrawdown:dd,meanNetReturn:st.mean,sharpe:sh};
}
function probabilityScore(predictions){const v=predictions.filter(x=>Number.isFinite(x.probability)&&x.actual);return v.length?v.reduce((s,x)=>s+(x.actual==="UP"?1-x.probability:x.actual==="DOWN"?x.probability:.5),0)/v.length:null}
function gate(m,{minAccuracy=.52,maxDrawdown=.15,minSamples=200,minSharpe=0}={}){return m.samples>=minSamples&&m.accuracy>=minAccuracy&&m.maxDrawdown<=maxDrawdown&&m.sharpe>=minSharpe}
module.exports={evaluate,probabilityScore,gate};
