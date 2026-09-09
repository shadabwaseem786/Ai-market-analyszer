// V170000 Triple-Barrier labeling contract with explicit event semantics.
export function tripleBarrierLabel(path=[], upper=0, lower=0, horizon=20){
  const n=Math.min(path.length,Math.max(0,Number(horizon)||0));
  for(let i=0;i<n;i++){const v=Number(path[i]);if(!Number.isFinite(v))continue;if(v>=upper)return {label:'UP',bars:i+1};if(v<=lower)return {label:'DOWN',bars:i+1};}
  return {label:'TIME',bars:n};
}
export function barrierLevels(entry,upPct=.02,downPct=.02){const e=Number(entry);return {upper:e*(1+Number(upPct)),lower:e*(1-Number(downPct))};}
