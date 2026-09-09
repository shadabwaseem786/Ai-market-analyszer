// V125300 probability calibration diagnostics.
function bins(pred=[],actual=[],count=10){
 const out=Array.from({length:count},()=>({n:0,p:0,y:0})); for(let i=0;i<Math.min(pred.length,actual.length);i++){const p=Math.max(0,Math.min(.9999,Number(pred[i]))),k=Math.floor(p*count),b=out[k];b.n++;b.p+=p;b.y+=Number(actual[i])?1:0}
 return {version:"V125300",bins:out.map((b,i)=>({bucket:i,n:b.n,predicted:b.n?+(b.p/b.n).toFixed(3):null,observed:b.n?+(b.y/b.n).toFixed(3):null}))};
}
module.exports={bins};