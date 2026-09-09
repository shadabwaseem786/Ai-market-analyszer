/*
 V380000 SCENARIO & STRESS INTELLIGENCE 2.0
 Regime-conditioned scenario matrix, Monte Carlo primitives, shock propagation,
 liquidity stress, survival/recovery diagnostics and decision adjustment.
 Research/decision-support only. No automatic execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 const quantile=(a,q)=>{if(!a.length)return null;const x=a.slice().sort((u,v)=>u-v),i=(x.length-1)*clamp(q,0,1),lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?x[lo]:x[lo]+(x[hi]-x[lo])*(i-lo)};
 function scenarios(base={}){
   return [
    {id:"BASE",name:"Base Case",shock:0,prob:n(base.baseProb,.45)},
    {id:"BULL",name:"Bull Expansion",shock:n(base.bullShock,.05),prob:n(base.bullProb,.2)},
    {id:"BEAR",name:"Bear Risk-Off",shock:n(base.bearShock,-.06),prob:n(base.bearProb,.2)},
    {id:"GAP",name:"Gap Shock",shock:n(base.gapShock,-.1),prob:n(base.gapProb,.05)},
    {id:"CRASH",name:"Crash",shock:n(base.crashShock,-.2),prob:n(base.crashProb,.02)},
    {id:"VOL",name:"Volatility Spike",shock:n(base.volShock,-.08),prob:n(base.volProb,.04)},
    {id:"LIQ",name:"Liquidity Shock",shock:n(base.liqShock,-.07),prob:n(base.liqProb,.04)}
   ];
 }
 function normalizeScenarioProbabilities(list){const s=list.reduce((a,x)=>a+n(x.prob),0)||1;return list.map(x=>({...x,prob:n(x.prob)/s}))}
 function boxMuller(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
 function monteCarlo(mu=0,sigma=.02,horizon=20,paths=1000,shock=0){
   const finals=[];for(let p=0;p<paths;p++){let x=1;for(let t=0;t<horizon;t++)x*=Math.exp(n(mu)-.5*n(sigma)**2+n(sigma)*boxMuller());finals.push(x*(1+n(shock)))}
   return {paths,horizon,mean:mean(finals),p05:quantile(finals,.05),median:quantile(finals,.5),p95:quantile(finals,.95),finals};
 }
 function stressDistribution(distribution=[],threshold=0){
   if(!distribution.length)return {lossProbability:0,expected:0,worst:0};
   return {lossProbability:distribution.filter(x=>n(x)<threshold).length/distribution.length,
     expected:mean(distribution),worst:Math.min(...distribution),p05:quantile(distribution,.05)};
 }
 function survival(equity=[],floor=0){if(!equity.length)return {survivalProbability:null,recoveryTime:null};const failed=equity.filter(x=>n(x)<=floor).length;return {survivalProbability:1-failed/equity.length,recoveryTime:null}}
 function recoveryTime(series=[],peakTolerance=.02){
   if(!series.length)return null;let peak=series[0],dd=false;for(let i=1;i<series.length;i++){peak=Math.max(peak,n(series[i]));if(n(series[i])<peak*(1-peakTolerance))dd=true; if(dd&&n(series[i])>=peak*(1-peakTolerance))return i}return null;
 }
 function portfolioShock(positions=[],shockMap={}){
   return positions.map(x=>({...x,shock:n(shockMap[x.symbol],0),pnlImpact:n(x.exposure)*n(shockMap[x.symbol],0)}));
 }
 function scenarioScore(sc,ctx={}){
   const regime=clamp(n(ctx.regimeCompatibility,1),0,1), catalyst=clamp(n(ctx.catalystCompatibility,1),0,1),liq=clamp(n(ctx.liquidityResilience,1),0,1);
   const severity=Math.abs(n(sc.shock)); return clamp((1-severity)*.4+regime*.25+catalyst*.2+liq*.15,0,1);
 }
 function scenarioMatrix(ctx={}){
   const ss=normalizeScenarioProbabilities(scenarios(ctx));return ss.map(s=>({...s,robustness:scenarioScore(s,ctx),status:scenarioScore(s,ctx)<n(ctx.minRobustness,.55)?"FRAGILE":"ROBUST"}))
 }
 function decisionAdjustment(baseDecision,stress={}){
   const robust=clamp(n(stress.robustness,1),0,1),loss=clamp(n(stress.lossProbability,0),0,1);
   if(loss>=n(stress.maxLossProbability,.35)||robust<n(stress.minRobustness,.55))return {action:"WAIT",adjusted:true,reason:"STRESS_RISK"};
   return {action:baseDecision||"WAIT",adjusted:false,reason:"STRESS_PASS"};
 }
 global.ScenarioStressV380000={scenarios,normalizeScenarioProbabilities,monteCarlo,stressDistribution,survival,recoveryTime,portfolioShock,scenarioScore,scenarioMatrix,decisionAdjustment};
})(typeof globalThis!=="undefined"?globalThis:window);
