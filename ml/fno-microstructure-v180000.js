// V180000 F&O MICROSTRUCTURE CORE
// Normalizes authorized/approved derivatives feeds. Missing fields are never inferred.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
const pct=(v,d=null)=>{const n=num(v,d);return n===null?null:clamp(n,-100,100)};
export function normalizeFNO(raw={}){
  const f=raw.futures||{}, o=raw.options||{}, p=raw.participant||{};
  const futures={price:num(f.price),oi:num(f.oi),oiChangePct:pct(f.oiChangePct),basisPct:pct(f.basisPct),volume:num(f.volume)};
  const options={pcr:num(o.pcr),atmIV:num(o.atmIV),ivChangePct:pct(o.ivChangePct),ivSkewPct:pct(o.ivSkewPct),callOI:num(o.callOI),putOI:num(o.putOI),callOIChange:num(o.callOIChange),putOIChange:num(o.putOIChange),atmStraddlePct:num(o.atmStraddlePct),maxPainDistancePct:pct(o.maxPainDistancePct),bidAskImbalance:pct(o.bidAskImbalance),oiConcentration:num(o.oiConcentration)};
  const participant={fiiIndexLong:num(p.fiiIndexLong),fiiIndexShort:num(p.fiiIndexShort),fiiStockLong:num(p.fiiStockLong),fiiStockShort:num(p.fiiStockShort)};
  const fields=[...Object.values(futures),...Object.values(options),...Object.values(participant)].filter(v=>v!==null&&v!==undefined&&Number.isFinite(Number(v)));
  const total=Object.values(futures).length+Object.values(options).length+Object.values(participant).length;
  const completeness=Math.round(fields.length/total*100);
  return {futures,options,participant,completeness,dataMode:completeness>=70?'DERIVATIVES_PARTIAL':'SPOT_ONLY'};
}
export function scoreFNO(raw={}){
 const d=normalizeFNO(raw), f=d.futures,o=d.options,p=d.participant; const signals=[];
 if(f.oiChangePct!==null&&f.basisPct!==null) signals.push(clamp((f.oiChangePct>0?1:-1)*Math.min(Math.abs(f.oiChangePct)/10,1)*.6 + clamp(f.basisPct/1.5,-1,1)*.4,-1,1));
 if(o.pcr!==null) signals.push(clamp((o.pcr-1)*1.8,-1,1));
 if(o.ivSkewPct!==null) signals.push(clamp(-o.ivSkewPct/10,-1,1));
 if(o.putOIChange!==null&&o.callOIChange!==null) signals.push(clamp((o.putOIChange-o.callOIChange)/Math.max(Math.abs(o.putOIChange)+Math.abs(o.callOIChange),1),-1,1));
 if(o.bidAskImbalance!==null) signals.push(clamp(o.bidAskImbalance/100,-1,1));
 if(p.fiiIndexLong!==null&&p.fiiIndexShort!==null) signals.push(clamp((p.fiiIndexLong-p.fiiIndexShort)/Math.max(Math.abs(p.fiiIndexLong)+Math.abs(p.fiiIndexShort),1),-1,1));
 const bias=signals.length?signals.reduce((a,b)=>a+b,0)/signals.length:0;
 const agreement=signals.length?Math.round(Math.max(signals.filter(x=>x>0).length,signals.filter(x=>x<0).length)/signals.length*100):0;
 return {fnoBias:Math.round((bias+1)*50),fnoEdge:Math.round(clamp(50+bias*35,5,95)),agreement,completeness:d.completeness,dataMode:d.dataMode,signalsUsed:signals.length};
}
