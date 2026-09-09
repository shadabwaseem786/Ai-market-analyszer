// V125400 performance stability and drawdown diagnostics.
function analyze(returns=[]){
 let equity=1,peak=1,maxDD=0; for(const r of returns){equity*=1+(Number(r)||0);peak=Math.max(peak,equity);maxDD=Math.max(maxDD,(peak-equity)/peak)}
 const mean=returns.length?returns.reduce((a,b)=>a+(Number(b)||0),0)/returns.length:0;
 return {version:"V125400",observations:returns.length,totalReturn:+(equity-1).toFixed(4),maxDrawdown:+(100*maxDD).toFixed(2),meanReturn:+mean.toFixed(5)};
}
module.exports={analyze};