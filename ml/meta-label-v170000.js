// V170000 Meta-Labeling: predicts whether an underlying directional signal is trade-worthy.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function metaLabelV170(x={}){
  const direction=clamp(Number(x.directionConfidence??50),0,100);
  const agreement=clamp(Number(x.agreement??0),0,100);
  const integrity=clamp(Number(x.integrity??0),0,100);
  const robustness=clamp(Number(x.robustness??0),0,100);
  const risk=clamp(Number(x.risk??100),0,100);
  const regimeFit=clamp(Number(x.regimeFit??50),0,100);
  const data=clamp(Number(x.dataQuality??0),0,100);
  const quality=Math.round(.20*direction+.15*agreement+.18*integrity+.18*robustness+.12*(100-risk)+.10*regimeFit+.07*data);
  const tradeable=quality>=72&&agreement>=65&&integrity>=70&&robustness>=70&&risk<=45&&data>=80;
  return {quality,tradeable,reason:tradeable?'Directional edge survived the meta-quality gate.':'Signal quality is insufficient after risk, integrity, regime and data checks.'};
}
