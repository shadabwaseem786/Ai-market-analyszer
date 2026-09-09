// V140000 QUANTUM F&O MATRIX — decision-support layer. No execution.
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
function finite(x){return Number.isFinite(Number(x));}
function sigmoid(x){return 1/(1+Math.exp(-x));}
function score(f){
  const parts=[];
  const add=(name,v,w)=>{if(finite(v)){parts.push({name,v:Number(v),w});}};
  add('trend',f.trend,0.18); add('momentum',f.momentum,0.16); add('rsi',f.rsi,0.08);
  add('volume',f.volume,0.08); add('fo',f.foPositioning,0.16); add('options',f.optionSurface,0.14);
  add('catalyst',f.catalyst,0.07); add('sector',f.sector,0.06); add('macro',f.macro,0.07);
  const w=parts.reduce((s,p)=>s+p.w,0)||1;
  const raw=parts.reduce((s,p)=>s+p.v*p.w,0)/w;
  const dispersion=parts.length>1?Math.sqrt(parts.reduce((s,p)=>s+p.w*Math.pow(p.v-raw,2),0)/w):50;
  const edge=clamp(50+raw*.45);
  const confidence=clamp(100-dispersion*.9);
  const integrity=clamp(confidence*.55+(parts.length/9)*45);
  const action=integrity>=82&&Math.abs(edge-50)>=18?(edge>50?'BUY':'SELL'):'WAIT';
  return {edge:Math.round(edge),confidence:Math.round(confidence),integrity:Math.round(integrity),action,featuresUsed:parts.length,dispersion:Math.round(dispersion)};
}
function quantumMatrix(observation){
  const f=observation||{};
  const base=score(f);
  const regime=f.regime||'UNKNOWN';
  const shock=regime==='HIGH-VOL'?25:regime==='TRANSITION'?12:0;
  const robustness=clamp(base.integrity-shock-(Number(f.risk)||0)*.25);
  const tailRisk=clamp((Number(f.risk)||50)+shock+(100-base.confidence)*.25);
  const gate=base.action!=='WAIT'&&robustness>=75&&tailRisk<55?'PASS':'ABSTAIN';
  return {...base,robustness:Math.round(robustness),tailRisk:Math.round(tailRisk),gate,action:gate==='PASS'?base.action:'WAIT'};
}
if(typeof module!=='undefined') module.exports={quantumMatrix};
