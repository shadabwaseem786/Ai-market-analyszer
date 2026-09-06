// V733 Market Regime Brain — deterministic multi-factor regime classifier.
// Decision support only; no order execution.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function classify(f={}){
 const score=clamp(Number(f.score??50),0,100), conf=clamp(Number(f.confidence??50),0,100), risk=clamp(Number(f.riskScore??50),0,100), health=clamp(Number(f.dataHealth??0),0,100);
 const agreement=clamp(Number(f.agreementPct??50),0,100), catalyst=clamp(Number(f.catalystConfidence??50),0,100), fresh=clamp(Number(f.catalystFreshness??50),0,100);
 const trend=score>=68?1:score<=32?-1:0;
 const volatility=risk>=68?"HIGH":risk<=32?"LOW":"NORMAL";
 let regime="RANGE";
 if(volatility==="HIGH"&&risk>=78) regime="LIQUIDITY_STRESS";
 else if(volatility==="HIGH"&&catalyst>=75) regime="EVENT_SHOCK";
 else if(trend>0&&agreement>=60) regime="TRENDING_BULL";
 else if(trend<0&&agreement>=60) regime="TRENDING_BEAR";
 else if(volatility==="HIGH") regime="HIGH_VOL";
 else if(volatility==="LOW"&&Math.abs(score-50)<12) regime="LOW_VOL";
 const evidence=[Math.abs(score-50)*2,agreement,catalyst,fresh,health].reduce((a,b)=>a+b,0)/5;
 const confidence=Math.round(clamp(evidence-(regime==="RANGE"?8:0),0,100));
 return {version:"V733-REGIME-BRAIN",regime,confidence,features:{score,agreement,risk,catalyst,fresh,health},method:"trend+agreement+volatility+catalyst+freshness+data-health"};
}
exports.classify=classify;