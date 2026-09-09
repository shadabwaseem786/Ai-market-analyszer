/* V820000 ADVANCED OPTIONS + VOLATILITY INTELLIGENCE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 function ivrv(iv,rv){const i=n(iv),r=Math.max(1e-9,n(rv));return{iv:i,rv:r,spread:i-r,ratio:i/r,state:i>r*1.2?"IV-PREMIUM":i<r*.85?"IV-DISCOUNT":"BALANCED"}}
 function skew(puts,calls){const p=mean(puts),c=mean(calls);return{putIV:p,callIV:c,skew:p-c,direction:p>c?"PUT-SKEW":"CALL-SKEW"}}
 function termStructure(points=[]){const a=points.map(x=>({days:n(x.days),iv:n(x.iv)})).sort((x,y)=>x.days-y.days);return{points:a,slope:a.length>1?(a[a.length-1].iv-a[0].iv)/Math.max(1,a[a.length-1].days-a[0].days):0,state:a.length>1?(a[a.length-1].iv>a[0].iv?"CONTANGO":"INVERTED"):"UNKNOWN"}}
 function greeksSurface(chain=[]){return chain.map(x=>({strike:n(x.strike),iv:n(x.iv),delta:n(x.delta),gamma:n(x.gamma),vega:n(x.vega),theta:n(x.theta),vanna:n(x.vanna),charm:n(x.charm)}))}
 function gex(chain=[]){return chain.reduce((s,x)=>s+n(x.gamma)*n(x.oi)*n(x.multiplier,1)*n(x.spot,1)**2*.01,0)}
 function dex(chain=[]){return chain.reduce((s,x)=>s+n(x.delta)*n(x.oi)*n(x.multiplier,1)*n(x.spot,1),0)}
 function gammaFlip(points=[]){const a=points.slice().sort((x,y)=>n(x.spot)-n(y.spot));for(let i=1;i<a.length;i++){if(n(a[i-1].gex)*n(a[i].gex)<0)return{found:true,level:(n(a[i-1].spot)+n(a[i].spot))/2}}return{found:false,level:null}}
 function pinRisk(chain=[],expirySpot){if(!chain.length)return{score:0,level:null};let best=null,dist=Infinity;chain.forEach(x=>{const d=Math.abs(n(x.strike)-n(expirySpot));if(d<dist){dist=d;best=n(x.strike)}});return{score:clamp(1-dist/Math.max(1,n(expirySpot)*.05),0,1),level:best}}
 function maxPain(chain=[]){const strikes=[...new Set(chain.map(x=>n(x.strike)))];if(!strikes.length)return null;let best=strikes[0],loss=Infinity;for(const s of strikes){let l=0;for(const x of chain){const oi=n(x.oi);l+=x.type==="CALL"?Math.max(0,s-n(x.strike))*oi:Math.max(0,n(x.strike)-s)*oi}if(l<loss){loss=l;best=s}}return{level:best,loss}}
 function oiMigration(current=[],previous=[]){const m=new Map(previous.map(x=>[n(x.strike),n(x.oi)]));return current.map(x=>({strike:n(x.strike),deltaOI:n(x.oi)-n(m.get(n(x.strike)),0)})).sort((a,b)=>Math.abs(b.deltaOI)-Math.abs(a.deltaOI))}
 function unusual(chain=[],avgVolume=1){return chain.filter(x=>n(x.volume)>n(avgVolume)*3||n(x.oiChange)>Math.max(100,n(x.oi)*.5)).map(x=>({...x,unusualScore:clamp(.5*n(x.volume)/Math.max(1,n(avgVolume))/3+.5*n(x.oiChangePct),0,1)}))}
 function expiryDynamics(x={}){return{daysToExpiry:n(x.daysToExpiry),isNearExpiry:n(x.daysToExpiry)<=2,gammaSensitivity:clamp(n(x.gammaSensitivity,.5),0,1),rollRisk:clamp(n(x.rollRisk,.5),0,1)}}
 function volRegime(iv,rv,history=[]){const spread=n(iv)-n(rv),h=history.map(n);const z=h.length?(n(iv)-mean(h))/(Math.sqrt(mean(h.map(v=>(v-mean(h))**2)))||1):0;return{spread,z,state:z>2?"VOL-SPIKE":z<-2?"VOL-COMPRESSED":spread>.1?"VOL-PREMIUM":"NORMAL"}}
 function fuse(x={}){const v=[n(x.ivrv,.5),n(x.skew,.5),n(x.gex,.5),n(x.dex,.5),n(x.oiMigration,.5),n(x.unusual,.5),n(x.expirySafety,.5)];const s=mean(v);return{score:clamp(s,0,1),direction:s>.6?"BULLISH":s<.4?"BEARISH":"NEUTRAL",confidence:Math.abs(s-.5)*2}}
 global.OptionsVolV820000={ivrv,skew,termStructure,greeksSurface,gex,dex,gammaFlip,pinRisk,maxPain,oiMigration,unusual,expiryDynamics,volRegime,fuse};
})(typeof globalThis!=="undefined"?globalThis:window);