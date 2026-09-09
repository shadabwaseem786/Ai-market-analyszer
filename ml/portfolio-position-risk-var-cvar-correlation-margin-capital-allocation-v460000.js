/*
 V460000 PORTFOLIO + POSITION RISK INTELLIGENCE
 Volatility sizing, ATR stops, VaR/CVaR, correlation, beta, concentration,
 F&O exposure/margin proxies, portfolio heat, risk/reward, capital allocation and kill-switches.
 No broker execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 const sum=a=>a.reduce((s,x)=>s+n(x),0);
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function atrRisk(atr,price,atrMult=2){const stop=n(price)-n(atr)*n(atrMult);return {atr:n(atr),stopDistance:n(atr)*n(atrMult),stop,stopPct:n(price)?n(atr)*n(atrMult)/n(price)*100:null}}
 function volatilitySize(capital,riskPct,stopDistance){const riskCapital=n(capital)*n(riskPct)/100;return {riskCapital,units:stopDistance?Math.floor(riskCapital/Math.abs(stopDistance)):0}}
 function riskReward(entry,target,stop){const risk=Math.abs(n(entry)-n(stop)),reward=Math.abs(n(target)-n(entry));return {risk,reward,ratio:risk?reward/risk:null}}
 function historicalVaR(returns=[],confidence=.95,capital=1){if(!returns.length)return null;const x=returns.slice().sort((a,b)=>a-b),idx=Math.floor((1-confidence)*x.length);const q=x[Math.max(0,idx)];return {returnVaR:q,capitalVaR:-q*n(capital)}}
 function cvar(returns=[],confidence=.95,capital=1){if(!returns.length)return null;const v=historicalVaR(returns,confidence,capital),tail=returns.filter(x=>n(x)<=n(v.returnVaR));return {returnCVaR:tail.length?mean(tail):v.returnVaR,capitalCVaR:-(tail.length?mean(tail):v.returnVaR)*n(capital)}}
 function covariance(a,b){const m1=mean(a),m2=mean(b),l=Math.min(a.length,b.length);return l?mean(Array.from({length:l},(_,i)=>(n(a[i])-m1)*(n(b[i])-m2))):0}
 function correlation(a,b){const c=covariance(a,b),sa=Math.sqrt(covariance(a,a)),sb=Math.sqrt(covariance(b,b));return sa&&sb?c/(sa*sb):0}
 function beta(asset,benchmark){const vb=covariance(benchmark,benchmark);return vb?covariance(asset,benchmark)/vb:null}
 function correlationMatrix(series={}){const keys=Object.keys(series),m={};keys.forEach(a=>{m[a]={};keys.forEach(b=>m[a][b]=correlation(series[a],series[b]))});return m}
 function concentration(positions=[]){const total=sum(positions.map(x=>Math.abs(n(x.marketValue)) ))||1;return positions.map(x=>({...x,weight:Math.abs(n(x.marketValue))/total})).sort((a,b)=>b.weight-a.weight)}
 function sectorConcentration(positions=[]){const g={};positions.forEach(p=>{const k=p.sector||"UNKNOWN";g[k]=(g[k]||0)+Math.abs(n(p.marketValue))});const total=sum(Object.values(g))||1;return Object.fromEntries(Object.entries(g).map(([k,v])=>[k,{marketValue:v,weight:v/total}]))}
 function fnoExposure(positions=[]){return positions.reduce((s,p)=>s+n(p.contractValue??p.marketValue)*Math.max(1,n(p.leverage,1)),0)}
 function marginBuffer(equity,usedMargin){return {equity:n(equity),usedMargin:n(usedMargin),available:n(equity)-n(usedMargin),utilization:n(equity)?n(usedMargin)/n(equity):1,buffer:n(equity)?1-n(usedMargin)/n(equity):0}}
 function portfolioHeat(positions=[]){return sum(positions.map(p=>Math.abs(n(p.riskCapital))))}
 function allocationScore(p={}){return clamp(.25*n(p.edge,.5)+.2*n(p.robustness,.5)+.2*n(p.confidence,.5)+.15*n(p.liquidity,.5)+.1*n(p.riskRewardScore,.5)+.1*(1-clamp(n(p.correlationRisk),0,1)),0,1)}
 function allocateCapital(positions=[],capital=1,maxHeatPct=6){const ranked=positions.map(p=>({...p,score:allocationScore(p)})).sort((a,b)=>b.score-a.score);const budget=n(capital)*n(maxHeatPct)/100;let used=0;return ranked.map(p=>{const requested=Math.max(0,n(p.riskCapital));const allocated=Math.min(requested,Math.max(0,budget-used));used+=allocated;return {...p,allocatedRiskCapital:allocated}})}
 function killSwitch(ctx={}){const reasons=[];if(n(ctx.drawdownPct)>=n(ctx.maxDrawdownPct,10))reasons.push("MAX_DRAWDOWN");if(n(ctx.marginUtilization)>=n(ctx.maxMarginUtilization,.8))reasons.push("MARGIN_STRESS");if(n(ctx.portfolioHeatPct)>=n(ctx.maxHeatPct,6))reasons.push("PORTFOLIO_HEAT");if(n(ctx.dataConfidence,.8)<n(ctx.minDataConfidence,.5))reasons.push("DATA_CONFIDENCE");if(ctx.marketPanic)reasons.push("MARKET_PANIC");return {triggered:reasons.length>0,reasons}}
 global.PortfolioRiskV460000={atrRisk,volatilitySize,riskReward,historicalVaR,cvar,covariance,correlation,beta,correlationMatrix,concentration,sectorConcentration,fnoExposure,marginBuffer,portfolioHeat,allocationScore,allocateCapital,killSwitch};
})(typeof globalThis!=="undefined"?globalThis:window);
