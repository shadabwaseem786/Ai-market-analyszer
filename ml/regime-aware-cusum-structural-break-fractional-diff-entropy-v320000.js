/*
 V320000 REGIME-AWARE FEATURE ENGINE
 CUSUM + structural breaks + fractional differentiation + entropy/complexity.
 Research/decision-support only. No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function mean(a){return a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0}
 function std(a){const m=mean(a);return a.length>1?Math.sqrt(a.reduce((s,x)=>s+(n(x)-m)**2,0)/(a.length-1)):0}
 function cusum(values,threshold=1){
   const m=mean(values),s=std(values)||1; let pos=0,neg=0,signals=[];
   values.forEach((v,i)=>{const z=(n(v)-m)/s;pos=Math.max(0,pos+z);neg=Math.min(0,neg+z);
     if(pos>=threshold||neg<=-threshold){signals.push({index:i,direction:pos>=threshold?"UP":"DOWN",score:Math.max(pos,-neg)});pos=0;neg=0}});
   return {signals,count:signals.length,threshold};
 }
 function changePoint(values,lookback=20,zThreshold=2){
   const out=[];
   for(let i=Math.max(lookback,1);i<values.length;i++){
     const prior=values.slice(i-lookback,i), cur=n(values[i]), m=mean(prior),s=std(prior)||1;
     const z=(cur-m)/s;if(Math.abs(z)>=zThreshold)out.push({index:i,z, direction:z>0?"UP_BREAK":"DOWN_BREAK"});
   }
   return {points:out,count:out.length};
 }
 function fracDiff(values,d=.4,window=50){
   const w=Math.min(window,values.length),weights=[1]; 
   for(let k=1;k<w;k++)weights.push(-weights[k-1]*(d-(k-1))/k);
   const out=[];
   for(let i=w-1;i<values.length;i++){let x=0;for(let k=0;k<w;k++)x+=weights[k]*n(values[i-k]);out.push(x)}
   return {values:out,order:d,window:w,weightTail:Math.abs(weights[w-1])};
 }
 function entropy(values,bins=10){
   if(!values.length)return 0;
   const mn=Math.min(...values),mx=Math.max(...values),span=mx-mn||1,counts=Array(bins).fill(0);
   values.forEach(v=>{const b=Math.min(bins-1,Math.max(0,Math.floor((v-mn)/span*bins)));counts[b]++});
   return -counts.reduce((s,c)=>{if(!c)return s;const p=c/values.length;return s-p*Math.log2(p)},0);
 }
 function complexity(values){
   if(values.length<3)return {entropy:0,turningRate:0,dispersion:0};
   const e=entropy(values), signs=[];
   for(let i=1;i<values.length;i++)signs.push(Math.sign(n(values[i])-n(values[i-1])));
   let turns=0;for(let i=1;i<signs.length;i++)if(signs[i]&&signs[i-1]&&signs[i]!==signs[i-1])turns++;
   return {entropy:e,entropyNormalized:e/Math.log2(10),turningRate:turns/Math.max(1,signs.length-1),dispersion:std(values)/(Math.abs(mean(values))+1e-9)};
 }
 function regime(x={}){
   const vol=clamp(n(x.volatility,0),0,1), trend=clamp(Math.abs(n(x.trendStrength,0)),0,1);
   const meanRev=clamp(n(x.meanReversion,0),0,1), ent=clamp(n(x.entropy,0),0,1);
   const br=Boolean(x.structuralBreak), cus=Boolean(x.cusumBreak);
   if(br||cus) return {label:"STRUCTURAL_BREAK",confidence:.9};
   if(vol>.75) return {label:"VOLATILITY_EXPANSION",confidence:vol};
   if(vol<.25 && trend>.55) return {label:"TRENDING_LOW_VOL",confidence:trend};
   if(trend>.65) return {label:"TRENDING",confidence:trend};
   if(meanRev>.65) return {label:"MEAN_REVERTING",confidence:meanRev};
   if(ent>.75) return {label:"HIGH_COMPLEXITY",confidence:ent};
   if(vol<.3) return {label:"VOLATILITY_COMPRESSION",confidence:1-vol};
   return {label:"MIXED",confidence:.5};
 }
 function regimeGate(x={}){
   const r=regime(x), allowed=x.allowedModels||{};
   const model=allowed[r.label]||"ENSEMBLE";
   const riskMultiplier=r.label==="STRUCTURAL_BREAK"?.4:r.label==="VOLATILITY_EXPANSION"?.6:1;
   return {regime:r,recommendedModel:model,riskMultiplier,
     action:r.label==="STRUCTURAL_BREAK"?"CAUTION":"NORMAL"};
 }
 global.RegimeEngineV320000={cusum,changePoint,fracDiff,entropy,complexity,regime,regimeGate};
})(typeof globalThis!=="undefined"?globalThis:window);
