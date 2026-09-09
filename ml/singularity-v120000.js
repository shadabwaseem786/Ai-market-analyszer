// V120000 SINGULARITY — conservative meta-decision layer.
// Never claims guaranteed accuracy. Uses supplied features only; missing evidence => ABSTAIN.
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
function finite(x){return Number.isFinite(Number(x));}
function score(f){
  const evidence=[]; const add=(name,v,w)=>{if(finite(v)){evidence.push({name,v:Number(v),w});}};
  add('technical',f.technical,0.16); add('momentum',f.momentum,0.12); add('foPositioning',f.foPositioning,0.20);
  add('optionSurface',f.optionSurface,0.16); add('catalyst',f.catalyst,0.10); add('sector',f.sector,0.08);
  add('macro',f.macro,0.08); add('crossAsset',f.crossAsset,0.05); add('historicalAnalog',f.historicalAnalog,0.05);
  if(evidence.length<4) return {state:'NO-TRADE',reason:'insufficient independent evidence',edge:null,agreement:null};
  const total=evidence.reduce((s,x)=>s+x.w,0); const raw=evidence.reduce((s,x)=>s+x.v*x.w,0)/total;
  const pos=evidence.filter(x=>x.v>12).reduce((s,x)=>s+x.w,0), neg=evidence.filter(x=>x.v<-12).reduce((s,x)=>s+x.w,0);
  const agreement=Math.round(Math.max(pos,neg)/total*100);
  const uncertainty=clamp(100-Math.abs(raw)*1.6-(agreement-50)*0.55);
  const risk=clamp(Number(f.risk),0,100);
  const shock=clamp(Number(f.shockRisk),0,100);
  const adversarial=clamp(Number(f.adversarialSurvival),0,100);
  const edge=Math.round(clamp(50+raw*0.45-(uncertainty-35)*0.10));
  const pass=agreement>=78 && Math.abs(edge-50)>=18 && risk<=35 && shock<70 && adversarial>=75;
  const action=pass?(edge>=68?'BUY':edge<=32?'SELL':'WAIT'):'WAIT';
  return {state:action==='WAIT'?'ABSTAIN':action,action,edge,agreement,uncertainty,risk,adversarialSurvival:adversarial,evidenceCount:evidence.length,reason:pass?'all critical gates passed':'one or more gates failed'};
}
module.exports={score};
