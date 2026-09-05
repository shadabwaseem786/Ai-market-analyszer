// V106000 Self-Evolving Research Laboratory — governed research improvement. NO live trading.
function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,Number(x)||0))}
function evaluate(candidate={},baseline={}){
 const c={score:clamp(candidate.score),calibration:clamp(candidate.calibration),stability:clamp(candidate.stability),oos:clamp(candidate.oos),drift:clamp(candidate.drift)};
 const b={score:clamp(baseline.score),calibration:clamp(baseline.calibration),stability:clamp(baseline.stability),oos:clamp(baseline.oos),drift:clamp(baseline.drift)};
 const improvement=(c.score-b.score)*.30+(c.calibration-b.calibration)*.25+(c.stability-b.stability)*.20+(c.oos-b.oos)*.20+(b.drift-c.drift)*.05;
 const qualifies=improvement>=5&&c.oos>=70&&c.calibration>=65&&c.stability>=65&&c.drift<=30;
 return {version:"V106000",improvement:+improvement.toFixed(2),qualifies,championChange:qualifies?"CANDIDATE_FOR_REVIEW":"REJECT",automaticPromotion:false,liveDeployment:false};
}
module.exports={evaluate};