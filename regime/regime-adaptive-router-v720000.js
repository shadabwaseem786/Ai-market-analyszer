/* V720000 REGIME DETECTOR + ADAPTIVE STRATEGY ROUTER */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function classify(f={}){
   const trend=Math.abs(n(f.trendStrength)), vol=n(f.volatility), volPct=n(f.volatilityPercentile,.5), breadth=n(f.breadth,.5), liq=n(f.liquidity,.7), event=n(f.eventIntensity,0), breakout=n(f.breakoutScore,0), meanRev=n(f.meanReversionScore,0);
   let regime="BALANCED";
   if(liq<.3)regime="LIQUIDITY-STRESSED";
   else if(event>.8)regime="EVENT-DRIVEN";
   else if(volPct>.8&&trend<.45)regime="PANIC/HIGH-VOL";
   else if(volPct>.75)regime="HIGH-VOLATILITY";
   else if(volPct<.25)regime="LOW-VOLATILITY";
   else if(breakout>.75&&trend>.6)regime="BREAKOUT";
   else if(trend>.7)regime="TRENDING";
   else if(meanRev>.7)regime="MEAN-REVERSION";
   else if(trend<.3)regime="RANGE";
   const confidence=clamp(.25+Math.abs(trend-.5)*.5+Math.abs(volPct-.5)*.25+Math.abs(breakout-meanRev)*.25,0,1);
   return{regime,confidence,features:{trend,vol,volPct,breadth,liq,event,breakout,meanRev}}
 }
 const profiles={
  "TRENDING":{trend:1,meanReversion:.35,breakout:.85,event:.5},
  "RANGE":{trend:.35,meanReversion:1,breakout:.3,event:.4},
  "HIGH-VOLATILITY":{trend:.6,meanReversion:.6,breakout:.65,event:.7},
  "LOW-VOLATILITY":{trend:.55,meanReversion:.7,breakout:.75,event:.35},
  "BREAKOUT":{trend:1,meanReversion:.2,breakout:1,event:.55},
  "MEAN-REVERSION":{trend:.25,meanReversion:1,breakout:.25,event:.35},
  "EVENT-DRIVEN":{trend:.45,meanReversion:.35,breakout:.55,event:1},
  "PANIC/HIGH-VOL":{trend:.35,meanReversion:.55,breakout:.35,event:.9},
  "LIQUIDITY-STRESSED":{trend:.2,meanReversion:.25,breakout:.15,event:.7},
  "BALANCED":{trend:.5,meanReversion:.5,breakout:.5,event:.5}
 };
 function route(regime,models={}){
   const p=profiles[regime]||profiles.BALANCED;
   const names=Object.keys(models);
   const scores=names.map(name=>{const m=models[name]||{};return clamp(n(m.baseWeight,1)*(n(m.regimeFit?.[regime],p[m.specialty]||.5)),0,10)});
   const total=scores.reduce((a,b)=>a+b,0)||1;
   return Object.fromEntries(names.map((name,i)=>[name,scores[i]/total]))
 }
 function adaptiveRouter(features,models){const d=classify(features);return{...d,weights:route(d.regime,models),profile:profiles[d.regime]||profiles.BALANCED}}
 function transition(prev,next,threshold=.15){return{from:prev,to:next,changed:prev!==next,material:prev!==next,confidenceGap:threshold}}
 function regimeGate(r={},cfg={}){const pass=n(r.confidence)>=n(cfg.minConfidence,.6)&&r.regime!=="LIQUIDITY-STRESSED";return{pass,action:pass?"ROUTE_NORMALLY":"REDUCE_WEIGHTS / WAIT",reason:pass?"REGIME_CONFIDENT":"REGIME_UNCERTAIN_OR_STRESSED"}}
 global.RegimeV720000={classify,route,adaptiveRouter,transition,regimeGate,profiles};
})(typeof globalThis!=="undefined"?globalThis:window);