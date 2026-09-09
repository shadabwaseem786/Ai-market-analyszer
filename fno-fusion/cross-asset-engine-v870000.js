/* V870000 CROSS-ASSET + INTERMARKET INTELLIGENCE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 function zscore(x,mu,sd){return sd? (n(x)-n(mu))/Math.abs(n(sd)):0}
 function crossIndex(x={}){const vals=[n(x.nifty,.5),n(x.banknifty,.5),n(x.finnifty,.5)];return{score:mean(vals),dispersion:Math.max(...vals)-Math.min(...vals),alignment:Math.max(...vals)-Math.min(...vals)<.2?"ALIGNED":"DIVERGENT"}}
 function vix(x={}){const v=n(x.value),chg=n(x.change);return{value:v,change:chg,state:v>25?"PANIC":v>18?"ELEVATED":v<12?"COMPLACENT":"NORMAL"}}
 function fx(x={}){return{usdInr:n(x.usdInr),change:n(x.change),stress:clamp(Math.abs(n(x.change))/2,0,1)}}
 function commodity(x={}){const oil=n(x.oil,.5),gold=n(x.gold,.5);return{oil,gold,oilShock:clamp(Math.abs(oil-.5)*2,0,1),goldRisk:clamp(Math.abs(gold-.5)*2,0,1)}}
 function rates(x={}){const us=n(x.us10y,.5),india=n(x.india10y,.5);return{us10y:us,india10y:india,spread:india-us}}
 function globalEquity(x={}){const vals=Object.values(x).map(v=>n(v,.5));return{score:mean(vals),dispersion:vals.length?Math.max(...vals)-Math.min(...vals):0}}
 function asia(x={}){return globalEquity(x)}
 function corr(a=[],b=[]){const L=Math.min(a.length,b.length);if(L<2)return 0;const ma=mean(a.slice(0,L)),mb=mean(b.slice(0,L));let xy=0,aa=0,bb=0;for(let i=0;i<L;i++){const x=n(a[i])-ma,y=n(b[i])-mb;xy+=x*y;aa+=x*x;bb+=y*y}return aa&&bb?xy/Math.sqrt(aa*bb):0}
 function transmission(x={}){const vals=[Math.abs(n(x.dxy,.5)-.5)*2,Math.abs(n(x.oil,.5)-.5)*2,Math.abs(n(x.us10y,.5)-.5)*2,Math.abs(n(x.usEquity,.5)-.5)*2,Math.abs(n(x.asia,.5)-.5)*2];return{score:clamp(mean(vals),0,1),channels:vals}}
 function riskRegime(x={}){const stress=clamp(.25*n(x.vix,.5)+.2*n(x.fx,.5)+.2*n(x.oil,.5)+.2*n(x.rates,.5)+.15*n(x.globalRisk,.5),0,1);return{score:stress,state:stress>.75?"RISK-OFF":stress<.3?"RISK-ON":"MIXED"}}
 function leadLag(x={}){return{leader:x.leader||"UNKNOWN",lag:x.lag||"UNKNOWN",strength:clamp(n(x.strength,.5),0,1)}}
 function divergence(x={}){return{flag:Math.abs(n(x.a,.5)-n(x.b,.5))>.25,spread:Math.abs(n(x.a,.5)-n(x.b,.5))}}
 function contagion(x={}){const s=clamp(mean(Object.values(x).map(v=>Math.abs(n(v,.5)-.5)*2)),0,1);return{score:s,state:s>.7?"HIGH":s>.4?"WATCH":"LOW"}}
 function globalIndia(x={}){const s=clamp(mean([n(x.global,.5),n(x.fx,.5),n(x.commodity,.5),n(x.rates,.5),n(x.volatility,.5)]),0,1);return{score:s,direction:s>.6?"NEGATIVE-STRESS":s<.4?"POSITIVE-RISK":"NEUTRAL"}}
 function fuse(x={}){const s=mean([n(x.crossIndex,.5),n(x.vix,.5),n(x.fx,.5),n(x.commodity,.5),n(x.rates,.5),n(x.global,.5),n(x.transmission,.5),n(x.contagion,.5)]);return{score:clamp(s,0,1),risk:s>.65?"HIGH":s<.35?"LOW":"MEDIUM",confidence:Math.abs(s-.5)*2}}
 global.CrossAssetV870000={zscore,crossIndex,vix,fx,commodity,rates,globalEquity,asia,corr,transmission,riskRegime,leadLag,divergence,contagion,globalIndia,fuse};
})(typeof globalThis!=="undefined"?globalThis:window);