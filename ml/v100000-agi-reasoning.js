// V100000 AGI-style Market Reasoning Layer — research-only.
// A deterministic, auditable reasoning scaffold. It does not claim AGI or guaranteed prediction.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const num=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
function normalizeState(s={}){
 const score=clamp(num(s.score,50)/100), conf=clamp(num(s.confidence,50)/100);
 const risk=clamp(num(s.risk,50)/100), cat=clamp(num(s.catalystConfidence,50)/100);
 const agree=clamp(num(s.agreement,50)/100), data=clamp(num(s.dataHealth,50)/100);
 return {score,conf,risk,cat,agree,data,regime:String(s.regime||"UNKNOWN"),bias:String(s.bias||"NEUTRAL")};
}
function reason(state={}){
 const s=normalizeState(state);
 const evidence=(s.score*.22+s.conf*.16+s.cat*.12+s.agree*.16+s.data*.20+(1-s.risk)*.14);
 const contradiction=Math.abs(s.score-.5)*.18 + Math.max(0,.55-s.agree)*.35;
 const uncertainty=clamp(.12+(1-s.data)*.28+(1-s.conf)*.18+s.risk*.16+contradiction*.55);
 const robustness=clamp(.45*evidence+.35*s.data+.20*(1-uncertainty));
 const bull=clamp(evidence+(.5-s.risk)*.12-contradiction);
 const bear=clamp(1-evidence+(s.risk-.5)*.12+contradiction);
 let decision="ABSTAIN";
 if(s.data<.75 || uncertainty>.62 || s.agree<.48) decision="WAIT";
 else if(bull>=.66 && bull-bear>=.12) decision="BULLISH";
 else if(bear>=.66 && bear-bull>=.12) decision="BEARISH";
 else decision="WAIT";
 return {version:"V100000",decision,evidence:+(evidence*100).toFixed(1),bullProbability:+(bull*100).toFixed(1),bearProbability:+(bear*100).toFixed(1),uncertainty:+(uncertainty*100).toFixed(1),robustness:+(robustness*100).toFixed(1),contradiction:+(contradiction*100).toFixed(1),state:s};
}
module.exports={normalizeState,reason};