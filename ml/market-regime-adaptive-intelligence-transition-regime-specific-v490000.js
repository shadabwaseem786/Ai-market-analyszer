/*
 V490000 MARKET REGIME + ADAPTIVE INTELLIGENCE
 Classifies market, volatility, liquidity, correlation, F&O, catalyst and flow regimes;
 detects transitions; produces regime confidence; applies regime-specific model/risk/execution
 configuration. Feed-agnostic and decision-support only.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;

 function marketRegime(ctx={}){const trend=n(ctx.trendScore),vol=n(ctx.volatilityScore,.5),breadth=n(ctx.breadthScore,.5),chop=n(ctx.chopScore,.5);if(trend>.6&&breadth>.55)return "BULL";if(trend<-.6&&breadth<.45)return "BEAR";if(chop>.65)return "CHOPPY";return "SIDEWAYS"}
 function volatilityRegime(v,low=.33,high=.67){return n(v,.5)>=high?"HIGH":n(v,.5)<=low?"LOW":"NORMAL"}
 function liquidityRegime(v,low=.33,high=.67){return n(v,.5)>=high?"DEEP":n(v,.5)<=low?"THIN":"NORMAL"}
 function correlationRegime(v,low=.33,high=.67){return n(v,.5)>=high?"HIGH_CORRELATION":n(v,.5)<=low?"LOW_CORRELATION":"NORMAL"}
 function fnoRegime(ctx={}){const oi=n(ctx.oiSignal),basis=n(ctx.basisScore),skew=n(ctx.skewScore);if(oi>.6&&basis>.55)return "RISK_ON_LONG_BUILD";if(oi<-.6&&basis<-.55)return "RISK_OFF_SHORT_BUILD";if(Math.abs(skew)>.7)return "SKEW_STRESSED";return "BALANCED"}
 function catalystRegime(v){return n(v,.5)>=.75?"HOT":n(v,.5)<=.3?"QUIET":"ACTIVE"}
 function flowRegime(v){return n(v,.5)>=.7?"STRONG_INFLOW":n(v,.5)<=.3?"STRONG_OUTFLOW":"MIXED"}
 function compositeRegime(c={}){return {market:marketRegime(c),volatility:volatilityRegime(c.volatility),liquidity:liquidityRegime(c.liquidity),correlation:correlationRegime(c.correlation),fno:fnoRegime(c),catalyst:catalystRegime(c.catalyst),flow:flowRegime(c.flow)}}
 function regimeVector(r={}){return Object.values(r)}
 function transitionScore(previous={},current={}){const keys=new Set([...Object.keys(previous),...Object.keys(current)]);let changed=0,total=0,changes=[];for(const k of keys){total++;if(previous[k]!==current[k]){changed++;changes.push({dimension:k,from:previous[k],to:current[k]})}}return {score:total?changed/total:0,changed,changes}}
 function regimeConfidence(ctx={}){const vals=[n(ctx.marketConfidence,.5),n(ctx.volatilityConfidence,.5),n(ctx.liquidityConfidence,.5),n(ctx.correlationConfidence,.5),n(ctx.fnoConfidence,.5),n(ctx.catalystConfidence,.5),n(ctx.flowConfidence,.5)];return mean(vals)}
 function adaptiveConfig(regime={}){const r=regime.market;return {modelRiskMultiplier:r==="BULL"?.95:r==="BEAR"?1.1:r==="CHOPPY"?1.25:1,executionMode:regime.liquidity==="THIN"?"PASSIVE_ONLY":regime.volatility==="HIGH"?"LIMIT_FIRST":"FLEXIBLE",maxPositionMultiplier:r==="CHOPPY"?.5:regime.volatility==="HIGH"?.7:1,confidenceFloor:r==="CHOPPY"?.7:regime.volatility==="HIGH"?.65:.6}}
 function earlyWarning(history=[],current={}){if(!history.length)return {warning:false,score:0};const prev=history[history.length-1],t=transitionScore(prev,current);return {warning:t.score>=.3,score:t.score,changes:t.changes}}
 function regimePersistence(history=[],key="market",minPeriods=3){if(history.length<minPeriods)return {stable:false,count:history.length};const last=history[history.length-1]?.[key],count=history.slice().reverse().findIndex(x=>x?.[key]!==last);return {stable:count===-1||count+1>=minPeriods,last,count:count===-1?history.length:count+1}}
 function regimeAdjustedSignal(signal={},regime={},confidence=.5){const cfg=adaptiveConfig(regime);const base=n(signal.confidence,.5);return {...signal,adjustedConfidence:clamp(base*n(confidence,.5),0,1),riskMultiplier:cfg.modelRiskMultiplier,executionMode:cfg.executionMode,maxPositionMultiplier:cfg.maxPositionMultiplier,confidenceFloor:cfg.confidenceFloor,action:(base*n(confidence,.5))>=cfg.confidenceFloor?signal.action:"WAIT"}}
 global.RegimeAdaptiveV490000={marketRegime,volatilityRegime,liquidityRegime,correlationRegime,fnoRegime,catalystRegime,flowRegime,compositeRegime,regimeVector,transitionScore,regimeConfidence,adaptiveConfig,earlyWarning,regimePersistence,regimeAdjustedSignal};
})(typeof globalThis!=="undefined"?globalThis:window);
