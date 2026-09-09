/*
 V510000 SYSTEM HEALTH + FAILOVER
 Scores freshness, completeness, latency and source availability.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function sourceHealth(s={}){const freshness=clamp(n(s.freshnessScore,1),0,1),completeness=clamp(n(s.completenessScore,1),0,1),latency=clamp(1-n(s.latencyMs,0)/5000,0,1),available=s.available!==false;const score=available?(freshness*.4+completeness*.35+latency*.25):0;return {available,freshness,completeness,latency,score,state:score>=.8?"HEALTHY":score>=.55?"DEGRADED":"UNHEALTHY"}}
 function chooseSource(sources=[]){return [...sources].map(sourceHealth).sort((a,b)=>b.score-a.score)[0]||null}
 function systemHealth(sources=[]){const hs=sources.map(sourceHealth);const score=hs.length?hs.reduce((a,x)=>a+x.score,0)/hs.length:0;return {score,state:score>=.8?"HEALTHY":score>=.55?"DEGRADED":"CRITICAL",sources:hs}}
 global.SystemHealthV510000={sourceHealth,chooseSource,systemHealth};
})(typeof globalThis!=="undefined"?globalThis:window);
