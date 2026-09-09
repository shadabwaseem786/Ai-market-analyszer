/* V640000 MARKET REGIME + REGIME TRANSITION INTELLIGENCE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 function volatility(returns=[]){if(returns.length<2)return 0;const m=mean(returns);return Math.sqrt(mean(returns.map(x=>(n(x)-m)**2)))}
 function trendScore(prices=[]){if(prices.length<2)return 0;const first=n(prices[0]),last=n(prices.at(-1));if(!first)return 0;return clamp((last-first)/Math.abs(first),-1,1)}
 function breadthScore(breadth=0){return clamp(n(breadth,.5),-1,1)}
 function liquidityScore(x=.5){return clamp(n(x,.5),0,1)}
 function classify(input={}){
   const t=trendScore(input.prices||[]), v=volatility(input.returns||[]), b=breadthScore(input.breadth), l=liquidityScore(input.liquidity);
   const volHigh=v>=n(input.volHigh,.02), trend=Math.abs(t)>=n(input.trendThreshold,.04);
   let regime="RANGE";
   if(volHigh&&t<-.04)regime="PANIC_SELL";
   else if(volHigh&&t>.04)regime="VOLATILE_TREND";
   else if(trend&&t>0)regime="TREND_UP";
   else if(trend&&t<0)regime="TREND_DOWN";
   else if(b>.25&&t>=0)regime="BULLISH_BREADTH";
   else if(b<-.25&&t<=0)regime="BEARISH_BREADTH";
   if(l<.2)regime="LOW_LIQUIDITY";
   return{regime,trendScore:t,volatility:v,breadth:b,liquidity:l};
 }
 function transitionProbability(history=[],current,window=20){
   const h=history.slice(-window); if(!h.length)return{};
   const counts={}; for(let i=1;i<h.length;i++){const from=h[i-1],to=h[i];if(from===current){counts[to]=(counts[to]||0)+1}}
   const total=Object.values(counts).reduce((a,b)=>a+b,0)||1;
   return Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,v/total]));
 }
 function transitionAlert(probabilities={},threshold=.35){return Object.entries(probabilities).filter(([,p])=>p>=threshold).sort((a,b)=>b[1]-a[1]).map(([regime,p])=>({regime,probability:p}))}
 function regimeWeights(models=[],regime){return models.map(m=>({...m,weight:clamp(n(m.baseWeight,.5)*n(m.regimeMultipliers?.[regime],1),0,1)}))}
 function threshold(base=.5,regime="RANGE",map={}){return clamp(n(base)*n(map[regime],1),0,1)}
 function riskMultiplier(regime,map={}){return clamp(n(map[regime],1),.1,1.5)}
 function adaptiveDecision(signal={},regimeInfo={},cfg={}){
   const s=clamp(n(signal.confidence,.5),0,1), req=threshold(n(cfg.baseThreshold,.6),regimeInfo.regime,cfg.thresholdMultipliers||{});
   const rm=riskMultiplier(regimeInfo.regime,cfg.riskMultipliers||{});
   const action=s>=req?(signal.action||"BUY"):"WAIT";
   return{action,confidence:s,requiredConfidence:req,riskMultiplier:rm,regime:regimeInfo.regime};
 }
 function earlyWarning(current,history=[],cfg={}){const p=transitionProbability(history,current,cfg.window||20);return{current,transitions:transitionAlert(p,cfg.alertThreshold||.35),probabilities:p}}
 function scoreRegime(outcomes=[],regime){const a=outcomes.filter(x=>x.regime===regime);if(!a.length)return{count:0,expectancy:0,winRate:0};const wins=a.filter(x=>n(x.pnl)>0).length;return{count:a.length,expectancy:mean(a.map(x=>n(x.pnl))),winRate:wins/a.length}}
 global.MarketRegimeV640000={volatility,trendScore,breadthScore,liquidityScore,classify,transitionProbability,transitionAlert,regimeWeights,threshold,riskMultiplier,adaptiveDecision,earlyWarning,scoreRegime};
})(typeof globalThis!=="undefined"?globalThis:window);