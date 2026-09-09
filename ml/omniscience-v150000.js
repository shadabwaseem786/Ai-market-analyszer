// V150000 OMNISCIENCE decision layer. Fail-closed when critical evidence is unavailable.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function omniscienceV150(x={}){
  const data=n(x.dataQuality,0), integrity=n(x.integrity,0), robust=n(x.robustness,0), unc=n(x.uncertainty,100), risk=n(x.risk,100), agree=n(x.agreement,0);
  const gate=data>=80&&integrity>=72&&robust>=72&&unc<=35&&risk<=40&&agree>=75;
  const action=gate?(x.edge>=68?'BUY':x.edge<=32?'SELL':'WAIT'):'WAIT';
  return {action,gate:gate?'PASS':'ABSTAIN',oracleScore:clamp(Math.round(.25*integrity+.25*robust+.2*agree+.15*(100-unc)+.15*(100-risk)),0,100),reason:gate?'Independent evidence survived quality, risk and robustness gates.':'Insufficient or conflicting evidence; abstaining is safer than forcing a trade.'};
}
function n(v,d){return Number.isFinite(Number(v))?Number(v):d}
