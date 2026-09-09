/* V580000 MULTI-TIMEFRAME + CONFLUENCE ENGINE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const order=["1m","5m","15m","30m","1h","4h","1d"];
 function normalize(tf={}){return {timeframe:tf.timeframe,trend:n(tf.trend),momentum:n(tf.momentum),regime:tf.regime||"UNKNOWN",catalyst:n(tf.catalyst,.5),fno:n(tf.fno,.5),confidence:clamp(n(tf.confidence,.5),0,1),price:n(tf.price),vwap:n(tf.vwap)}} 
 function align(frames=[]){const a=frames.map(normalize), bull=a.filter(x=>x.trend>0.2).length, bear=a.filter(x=>x.trend<-.2).length;
   return {frames:a, bullish:bull,bearish:bear,alignment:bull>bear?"BULLISH":bear>bull?"BEARISH":"MIXED",ratio:Math.max(bull,bear)/Math.max(1,a.length),
     conflicts:a.filter(x=>x.trend>0.2).length&&a.filter(x=>x.trend<-.2).length>0};
 }
 function hierarchy(frames=[]){return [...frames].sort((a,b)=>order.indexOf(a.timeframe)-order.indexOf(b.timeframe));}
 function confluence(frames=[]){const a=align(frames), weights={ "1m":.04,"5m":.06,"15m":.12,"30m":.14,"1h":.20,"4h":.20,"1d":.24};let s=0,w=0;
   for(const x of frames){const z=normalize(x),q=weights[z.timeframe]||.1; s+=q*(.5+clamp(z.trend,-1,1)*.5)*z.confidence;w+=q}
   return {score:clamp(s/(w||1),0,1),alignment:a.alignment,conflict:a.conflicts};
 }
 function falseBreakout(x={}){const failedRetest=!!x.failedRetest, volumeWeak=n(x.volumeConfirmation,.5)<.4, vwapReject=!!x.vwapReject, oiDivergence=!!x.oiDivergence;
   const risk=(failedRetest?1:0)+(volumeWeak?1:0)+(vwapReject?1:0)+(oiDivergence?1:0);
   return {risk,likelyFalse:risk>=2,reasons:[failedRetest&&"FAILED_RETEST",volumeWeak&&"WEAK_VOLUME",vwapReject&&"VWAP_REJECTION",oiDivergence&&"OI_DIVERGENCE"].filter(Boolean)};
 }
 function timeframeScore(x={}){return clamp(.35*n(x.confluence,.5)+.25*n(x.regimeAlignment,.5)+.2*n(x.catalyst,.5)+.2*n(x.fno,.5),0,1)}
 function optimalTimeframe(frames=[]){return [...frames].map(x=>({...x,score:timeframeScore(x)})).sort((a,b)=>b.score-a.score)[0]||null}
 function upgradeDecision(decision,cf,fb){if(fb.likelyFalse)return {...decision,action:"WAIT",reason:"FALSE_BREAKOUT_FILTER",confidence:Math.min(n(decision.confidence,.5),.55)};
   const boost=cf.score>=.75?.08:cf.score<=.35?-.08:0; return {...decision,confidence:clamp(n(decision.confidence,.5)+boost,0,1),mtfConfluence:cf.score};}
 global.MTFConfluenceV580000={normalize,align,hierarchy,confluence,falseBreakout,timeframeScore,optimalTimeframe,upgradeDecision};
})(typeof globalThis!=="undefined"?globalThis:window);