/* V830000 MULTI-TIMEFRAME + MULTI-HORIZON FORECAST FUSION */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 function align(frames={}){const keys=Object.keys(frames),vals=keys.map(k=>n(frames[k].score,.5));return{frames:keys,score:mean(vals),bullish:vals.filter(v=>v>.6).length,bearish:vals.filter(v=>v<.4).length,conflict:vals.some(v=>v>.6)&&vals.some(v=>v<.4)}}
 function conflictResolution(a={}){const short=n(a.short,.5),long=n(a.long,.5),macro=n(a.macro,.5);const conflict=(short>.6&&long<.4)||(short<.4&&long>.6);return{conflict,short,long,structuralBias:long>.6?"BULLISH":long<.4?"BEARISH":"NEUTRAL",tacticalBias:short>.6?"BULLISH":short<.4?"BEARISH":"NEUTRAL",action:conflict?"REDUCE-CONVICTION":short>.6&&long>.6?"LONG-BIAS":short<.4&&long<.4?"SHORT-BIAS":"WAIT"}}
 function horizonProbability(x={}){const base=n(x.base,.5),trend=n(x.trend,.5),options=n(x.options,.5),flow=n(x.flow,.5),regime=n(x.regime,.5);const p=.25*base+.2*trend+.2*options+.2*flow+.15*regime;return{probability:clamp(p,0,1),horizon:x.horizon||"UNSPECIFIED"}}
 function expectedRange(price,atr,mult=1){const p=n(price),a=Math.max(0,n(atr));return{low:p-a*n(mult),high:p+a*n(mult),range:2*a*n(mult)}}
 function pathForecast(x={}){const p=n(x.price),u=n(x.upProb,.5),d=n(x.downProb,.5),r=Math.max(0,n(x.range));return{price:p,upProbability:u,downProbability:d,neutralProbability:clamp(1-u-d,0,1),upper:p+r,lower:p-r}}
 function zoneProbability(levels=[],price){return levels.map(l=>{const d=Math.abs(n(l)-n(price));return{level:n(l),distance:d,proximity:1/(1+d)}}).sort((a,b)=>b.proximity-a.proximity)}
 function breakout(x={}){const b=n(x.breakoutEvidence,.5),v=n(x.volumeConfirmation,.5),r=n(x.retest,.5),f=n(x.failureRisk,.5);const success=clamp(.4*b+.25*v+.2*r+.15*(1-f),0,1);return{successProbability:success,fakeoutProbability:1-success}}
 function scenarioTree(x={}){const bull=clamp(n(x.bull,.33),0,1),bear=clamp(n(x.bear,.33),0,1),base=clamp(n(x.base,1-bull-bear),0,1);const s=bull+bear+base||1;return{bull:bull/s,base:base/s,bear:bear/s}}
 function timeDecay(confidence,elapsed,total){const e=Math.max(0,n(elapsed)),t=Math.max(1,n(total));return clamp(n(confidence)*(1-e/t),0,1)}
 function fuse(x={}){const a=align(x.frames||{}),c=conflictResolution(x.conflict||{});const p=horizonProbability(x);const penalty=c.conflict?.15:0;return{alignment:a,conflict:c,horizon:p,unifiedConfidence:clamp(p.probability*(1-penalty),0,1),action:c.action}}
 global.ForecastV830000={align,conflictResolution,horizonProbability,expectedRange,pathForecast,zoneProbability,breakout,scenarioTree,timeDecay,fuse};
})(typeof globalThis!=="undefined"?globalThis:window);