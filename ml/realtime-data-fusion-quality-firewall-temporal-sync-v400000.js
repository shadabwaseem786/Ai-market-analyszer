/*
 V400000 REAL-TIME MARKET DATA FUSION + DATA QUALITY FIREWALL
 Point-in-time temporal synchronization, stale/missing/outlier checks, feed conflict
 resolution and confidence scoring. Adapter-ready; no external feed/broker is assumed.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const median=a=>{if(!a.length)return null;const x=a.slice().sort((u,v)=>u-v),m=Math.floor(x.length/2);return x.length%2?x[m]:(x[m-1]+x[m])/2};
 function stale(ts,now,maxAgeMs){const t=new Date(ts).getTime();return !Number.isFinite(t)||n(now,Date.now())-t>n(maxAgeMs,300000)}
 function completeness(obj,required=[]){const missing=required.filter(k=>obj?.[k]===undefined||obj?.[k]===null||obj?.[k]==="");return {missing,score:required.length?1-missing.length/required.length:1}}
 function outlier(value,history=[],z=5){if(history.length<3)return {outlier:false,z:null};const m=history.reduce((s,x)=>s+n(x),0)/history.length,sd=Math.sqrt(history.reduce((s,x)=>s+(n(x)-m)**2,0)/(history.length-1))||1;const zz=(n(value)-m)/sd;return {outlier:Math.abs(zz)>=z,z:zz}}
 function temporalAlign(records=[],toleranceMs=1000){return records.slice().sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp)).map(r=>({...r,aligned:true,toleranceMs}))}
 function feedConsensus(feeds=[],field="price",maxDisagreementPct=.5){
   const vals=feeds.map(f=>n(f[field],NaN)).filter(Number.isFinite),m=median(vals); if(m===null)return {value:null,agreement:0,conflict:true};
   const deviations=vals.map(v=>Math.abs(v-m)/(Math.abs(m)||1)*100),max=Math.max(...deviations,0);
   return {value:m,agreement:clamp(1-max/n(maxDisagreementPct,.5),0,1),maxDeviationPct:max,conflict:max>n(maxDisagreementPct,.5),sources:vals.length};
 }
 function crossCheck(primary,reference,tolerancePct=.5){const a=n(primary),b=n(reference);return {differencePct:Math.abs(a-b)/(Math.abs(b)||1)*100,pass:Math.abs(a-b)/(Math.abs(b)||1)*100<=tolerancePct}}
 function qualityScore(ctx={}){
   const c=clamp(n(ctx.completeness,1),0,1),fresh=clamp(n(ctx.freshness,1),0,1),out=ctx.outlier?0:1,cons=clamp(n(ctx.consensus,1),0,1),temp=clamp(n(ctx.temporalSync,1),0,1);
   return clamp(.25*c+.25*fresh+.15*out+.2*cons+.15*temp,0,1)
 }
 function firewall(ctx={}){
   const issues=[];
   if(ctx.stale)issues.push("STALE_DATA");
   if(ctx.missing)issues.push("MISSING_DATA");
   if(ctx.outlier)issues.push("OUTLIER");
   if(ctx.conflict)issues.push("FEED_CONFLICT");
   if(ctx.temporalError)issues.push("TEMPORAL_MISALIGNMENT");
   const q=qualityScore(ctx), min=n(ctx.minQuality,.7);
   return {quality:q,issues,state:issues.length||q<min?"BLOCK":"PASS",dataConfidence:issues.length?Math.min(q,.49):q};
 }
 function fuseMarketSnapshot(sources=[],required=[]){
   const normalized=sources.map(s=>({...s,completeness:completeness(s,required)}));
   const valid=normalized.filter(s=>!s.stale&&!s.outlier);
   const fields=required.reduce((o,k)=>{o[k]=feedConsensus(valid,k);return o},{});
   return {sources:normalized,validSources:valid.length,fields,ready:valid.length>0&&Object.values(fields).every(x=>!x.conflict)};
 }
 global.DataFusionV400000={stale,completeness,outlier,temporalAlign,feedConsensus,crossCheck,qualityScore,firewall,fuseMarketSnapshot};
})(typeof globalThis!=="undefined"?globalThis:window);
