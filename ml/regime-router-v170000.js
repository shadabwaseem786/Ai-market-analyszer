// V170000 regime-aware model routing. No regime is treated as universally optimal.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function routeByRegimeV170(regime='UNKNOWN', models={}){
  const key=String(regime).toUpperCase();
  const pri={
    'TREND-UP':['trend','momentum','tree','neural'],
    'TREND-DOWN':['trend','momentum','tree','neural'],
    'SIDEWAYS':['meanReversion','tree','statistical','options'],
    'HIGH-VOL':['options','volatility','robust','tree'],
    'TRANSITION':['robust','statistical','neural','tree'],
    'UNKNOWN':['robust','tree','statistical']
  }[key]||['robust','tree','statistical'];
  const weights={}; let sum=0;
  pri.forEach((m,i)=>{if(models[m]!==undefined){const w=Math.max(.1,1-i*.2);weights[m]=w;sum+=w;}});
  Object.keys(weights).forEach(k=>weights[k]=weights[k]/sum);
  return {regime:key,weights,confidence:clamp(100-(key==='UNKNOWN'?35:key==='TRANSITION'?20:0),0,100)};
}
