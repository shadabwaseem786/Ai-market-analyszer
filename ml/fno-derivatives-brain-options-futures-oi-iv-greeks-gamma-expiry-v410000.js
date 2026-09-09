/*
 V410000 F&O DERIVATIVES BRAIN
 Futures basis/OI structure, option-chain metrics, IV/skew/term structure,
 Greeks, gamma/vanna/charm proxies, expiry dynamics, rollover and derivatives sentiment.
 Feed-agnostic; calculations use supplied snapshots. No order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const sum=a=>a.reduce((s,x)=>s+n(x),0);
 const pct=(a,b)=>b?((n(a)-n(b))/Math.abs(n(b)))*100:0;
 function futures(price,future,days=30,annual=365){const basis=n(future)-n(price),annualized=price?basis/price*(annual/n(days,1))*100:0;return {basis,basisPct:price?basis/price*100:0,annualizedPct:annualized}}
 function oiPriceMatrix(priceChangePct,oiChangePct){const p=n(priceChangePct),o=n(oiChangePct);return {quadrant:p>=0&&o>=0?"LONG_BUILDUP":p<0&&o>=0?"SHORT_BUILDUP":p>=0&&o<0?"SHORT_COVERING":"LONG_UNWINDING"}}
 function pcr(options=[]){const put=sum(options.map(x=>x.putOI??0)),call=sum(options.map(x=>x.callOI??0));return {putOI:put,callOI:call,pcr:call?put/call:null}}
 function ivStats(chain=[]){const iv=chain.map(x=>n(x.iv,NaN)).filter(Number.isFinite);if(!iv.length)return {mean:null,min:null,max:null};return {mean:sum(iv)/iv.length,min:Math.min(...iv),max:Math.max(...iv)}}
 function skew(puts=[],calls=[]){const pi=ivStats(puts),ci=ivStats(calls);return {putIV:pi.mean,callIV:ci.mean,skew:pi.mean!==null&&ci.mean!==null?pi.mean-ci.mean:null}}
 function termStructure(points=[]){return points.slice().sort((a,b)=>n(a.days)-n(b.days)).map((x,i,a)=>({...x,slope:i? n(x.iv)-n(a[i-1].iv):null}))}
 function bsGreeks(S,K,T,r,sigma,type="call"){S=n(S);K=n(K);T=Math.max(n(T),1e-6);r=n(r);sigma=Math.max(n(sigma),1e-6);const d1=(Math.log(S/K)+(r+.5*sigma*sigma)*T)/(sigma*Math.sqrt(T)),d2=d1-sigma*Math.sqrt(T);const N=x=>.5*(1+Math.erf(x/Math.SQRT2));const pdf=Math.exp(-.5*d1*d1)/Math.sqrt(2*Math.PI);const delta=type==="call"?N(d1):N(d1)-1;const gamma=pdf/(S*sigma*Math.sqrt(T));const vega=S*pdf*Math.sqrt(T)/100;const theta=(-(S*pdf*sigma)/(2*Math.sqrt(T))- (type==="call"?r*K*Math.exp(-r*T)*N(d2):-r*K*Math.exp(-r*T)*N(-d2)))/365;return {delta,gamma,vega,theta,d1,d2}}
 function maxPain(chain=[]){const strikes=[...new Set(chain.map(x=>n(x.strike)))].filter(Number.isFinite);if(!strikes.length)return null;let best=strikes[0],min=Infinity;for(const k of strikes){let pain=0;for(const x of chain){const s=n(x.strike),c=n(x.callOI),p=n(x.putOI);pain+=Math.max(0,k-s)*c+Math.max(0,s-k)*p}if(pain<min){min=pain;best=k}}return {strike:best,pain:min}}
 function walls(chain=[]){const calls=chain.slice().sort((a,b)=>n(b.callOI)-n(a.callOI)),puts=chain.slice().sort((a,b)=>n(b.putOI)-n(a.putOI));return {callWall:calls[0]||null,putWall:puts[0]||null}}
 function gammaExposure(chain=[],multiplier=1){return sum(chain.map(x=>n(x.gamma)*((n(x.callOI)-n(x.putOI)))*n(multiplier)))}
 function rollover(current=[],next=[]){const c=sum(current.map(x=>x.oi??0)),nn=sum(next.map(x=>x.oi??0));return {currentOI:c,nextOI:nn,rollRatio:c?nn/c:null}}
 function expiryRisk(daysToExpiry,iv,oiConcentration){const d=clamp(1-n(daysToExpiry)/30,0,1),v=clamp(n(iv)/50,0,1),o=clamp(n(oiConcentration),0,1);return clamp(.4*d+.35*v+.25*o,0,1)}
 function sentiment(ctx={}){const vals=[clamp(n(ctx.pcrBias),-1,1),clamp(n(ctx.oiPriceBias),-1,1),clamp(n(ctx.ivSkewBias),-1,1),clamp(n(ctx.basisBias),-1,1),clamp(n(ctx.gammaBias),-1,1)];return vals.reduce((s,x)=>s+x,0)/vals.length}
 function derivativesScore(ctx={}){return clamp(.2*n(ctx.pcrScore,.5)+.2*n(ctx.oiScore,.5)+.15*n(ctx.ivScore,.5)+.15*n(ctx.skewScore,.5)+.15*n(ctx.basisScore,.5)+.15*n(ctx.gammaScore,.5),0,1)}
 global.FNODerivativesV410000={futures,oiPriceMatrix,pcr,ivStats,skew,termStructure,bsGreeks,maxPain,walls,gammaExposure,rollover,expiryRisk,sentiment,derivativesScore};
})(typeof globalThis!=="undefined"?globalThis:window);
