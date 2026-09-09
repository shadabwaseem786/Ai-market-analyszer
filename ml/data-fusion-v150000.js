// V150000 OMNISCIENCE DATA FUSION — schema-first, fail-closed decision support.
// Accepts spot, futures and option-surface observations when a provider supplies them.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const n=x=>Number.isFinite(Number(x))?Number(x):null;
export function normalizeDerivativeEvidence(raw={}){
  const futures=raw.futures||{}; const opt=raw.optionSurface||{}; const participant=raw.participant||{};
  const completeness=[futures.price,futures.oi,futures.oiChange,futures.basis,opt.pcr,opt.iv,opt.ivSkew,opt.oiWall,participant.fiiNet].filter(v=>n(v)!==null).length/9;
  const foBias=n(futures.oiChange)===null||n(futures.priceChange)===null?null:clamp((Math.sign(n(futures.priceChange))*Math.sign(n(futures.oiChange))),-1,1);
  const optBias=n(opt.pcr)===null?null:clamp((n(opt.pcr)-1)*1.8,-1,1);
  const participantBias=n(participant.fiiNet)===null?null:clamp(n(participant.fiiNet)/10000,-1,1);
  const evidence=[foBias,optBias,participantBias].filter(v=>v!==null);
  const direction=evidence.length?evidence.reduce((a,b)=>a+b,0)/evidence.length:0;
  return {available:completeness>0, completeness:Math.round(completeness*100), futuresBias:foBias, optionBias:optBias, participantBias, derivativeBias:clamp(direction,-1,1), evidenceCount:evidence.length};
}
export function fuseV150({spot={},derivatives={},catalyst=0,sector=0,macro=0,regimeRisk=0,uncertainty=0}={}){
  const d=normalizeDerivativeEvidence(derivatives); const technical=clamp(n(spot.score)??0,-1,1);
  const parts=[{v:technical,w:.28},{v:d.derivativeBias,w:d.available?.28:0},{v:clamp(catalyst,-1,1),w:.12},{v:clamp(sector,-1,1),w:.10},{v:clamp(macro,-1,1),w:.08}];
  const active=parts.filter(x=>x.w>0&&x.v!==null); const denom=active.reduce((s,x)=>s+x.w,0)||1; const raw=active.reduce((s,x)=>s+x.v*x.w,0)/denom;
  const completeness=d.completeness; const integrity=clamp(Math.round(100-Math.abs(raw)*10-uncertainty*.45-(100-completeness)*.35),0,100);
  const robustness=clamp(Math.round(integrity-regimeRisk*.35-(d.available?0:12)),0,100);
  const edge=clamp(Math.round(50+raw*42),5,95);
  const action=robustness>=72&&Math.abs(edge-50)>=18?edge>=68?'BUY':edge<=32?'SELL':'WAIT':'WAIT';
  const gate=action==='WAIT'?'ABSTAIN':'PASS';
  return {edge,rawBias:raw,integrity,robustness,action,gate,derivatives:d,activeEvidence:active.length};
}
