/* V740000 OPTIONS INTELLIGENCE + TRUE MARKET TABLE FILTER */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function ivRank(iv,h,l){return h===l?0:clamp((iv-l)/(h-l),0,1)}
 function skew(puts,calls){return n(puts)-n(calls)}
 function termStructure(points=[]){return points.slice().sort((a,b)=>n(a.days)-n(b.days))}
 function realizedVsImplied(realized,implied){return{realized:n(realized),implied:n(implied),spread:n(implied)-n(realized),edge:n(implied)>n(realized)?"IV_PREMIUM":"IV_DISCOUNT"}}
 function gex(chain=[]){return chain.reduce((s,x)=>s+n(x.gamma)*n(x.openInterest)*n(x.spot)*n(x.multiplier,1)*n(x.direction,1),0)}
 function gammaFlip(levels=[]){let prev=null;for(const x of levels){const g=n(x.gex);if(prev&&((prev.g<=0&&g>0)||(prev.g>=0&&g<0)))return{x1:prev.level,x2:x.level};prev={level:n(x.level),g}}return null}
 function pcr(putOI,callOI){return n(callOI)?n(putOI)/n(callOI):null}
 function expiryPressure(x={}){return clamp(.35*n(x.oiConcentration,.5)+.25*n(x.gammaConcentration,.5)+.2*n(x.ivCompression,.5)+.2*n(x.daysToExpiry<=1?1:0),0,1)}
 function optionAnomaly(x={}){return{score:clamp(.4*Math.abs(n(x.ivZ))/4+.3*Math.abs(n(x.oiZ))/4+.3*Math.abs(n(x.volumeZ))/4,0,1),flag:Math.max(Math.abs(n(x.ivZ)),Math.abs(n(x.oiZ)),Math.abs(n(x.volumeZ)))>4}}
 function surfaceSignal(x={}){const s=clamp(.25*n(x.ivRank,.5)+.2*n(x.skewScore,.5)+.2*n(x.gexScore,.5)+.2*n(x.pcrScore,.5)+.15*(1-n(x.anomalyScore,0)),0,1);return{score:s,direction:s>.6?"BULLISH":s<.4?"BEARISH":"NEUTRAL"}}
 function filterUniverse(items=[],filter="ALL"){const f=String(filter).toUpperCase();if(f==="ALL")return items;const map={INDICES:["INDEX","INDICES"],STOCKS:["STOCK","EQUITY"],"STOCK F&O":["STOCK_FNO","STOCK F&O"],"INDEX F&O":["INDEX_FNO","INDEX F&O"],OPTIONS:["OPTION","OPTIONS"],FUTURES:["FUTURE","FUTURES"],ETFS:["ETF","FUND"]};return items.filter(x=>(map[f]||[f]).includes(String(x.type||"").toUpperCase()))}
 global.OptionsV740000={ivRank,skew,termStructure,realizedVsImplied,gex,gammaFlip,pcr,expiryPressure,optionAnomaly,surfaceSignal,filterUniverse};
})(typeof globalThis!=="undefined"?globalThis:window);