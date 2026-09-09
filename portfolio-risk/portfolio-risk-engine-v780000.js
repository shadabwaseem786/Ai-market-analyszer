/* V780000 PORTFOLIO RISK + POSITION INTELLIGENCE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function atrSize(capital,riskPct,atr,stopMult=1){const risk=n(capital)*n(riskPct);const perUnit=Math.max(1,n(atr)*n(stopMult));return Math.max(0,risk/perUnit)}
 function fractionalKelly(p,b,f=.25){p=n(p);b=Math.max(1e-9,n(b));const q=1-p;return clamp(n(f)*((p*b-q)/b),0,1)}
 function volTargetSize(capital,targetVol,assetVol,price){const tv=Math.max(1e-6,n(targetVol)),av=Math.max(1e-6,n(assetVol));return Math.max(0,n(capital)*tv/av/Math.max(1,n(price)))}
 function aggregateGreeks(positions=[]){return positions.reduce((a,x)=>{for(const k of ["delta","gamma","vega","theta","vanna","charm"])a[k]+=n(x[k])*n(x.quantity,1);return a},{delta:0,gamma:0,vega:0,theta:0,vanna:0,charm:0})}
 function covariance(a,b){const m1=mean(a),m2=mean(b),L=Math.min(a.length,b.length);if(!L)return 0;return a.slice(0,L).reduce((s,x,i)=>s+(n(x)-m1)*(n(b[i])-m2),0)/L}
 function correlation(a,b){const c=covariance(a,b),sa=sd(a),sb=sd(b);return sa&&sb?c/(sa*sb):0}
 function cluster(corr,threshold=.7){const nkeys=Object.keys(corr),groups=[];const used=new Set();nkeys.forEach(k=>{if(used.has(k))return;const g=[k];used.add(k);nkeys.forEach(j=>{if(!used.has(j)&&Math.abs(n(corr[k]?.[j]))>=threshold){g.push(j);used.add(j)}});groups.push(g)});return groups}
 function parametricVaR(portfolioVol,confidence,capital){const zmap={.9:1.282,.95:1.645,.975:1.96,.99:2.326};const z=zmap[confidence]||1.645;return Math.max(0,n(capital)*n(portfolioVol)*z)}
 function expectedShortfall(varValue,confidence=.95){return n(varValue)*(1+(1-confidence)/Math.max(1e-6,1-confidence*0.5))}
 function stress(positionValue,scenarios=[]){return scenarios.map(s=>({...s,pnl:n(positionValue)*n(s.returnPct)}))}
 function monteCarlo(returns=[],paths=1000,steps=20){const mu=mean(returns),sig=sd(returns);let seed=42;const rand=()=>{seed=(1664525*seed+1013904223)%4294967296;return seed/4294967296};const normal=()=>Math.sqrt(-2*Math.log(Math.max(1e-9,rand())))*Math.cos(2*Math.PI*rand());const outcomes=[];for(let p=0;p<Math.min(paths,5000);p++){let v=1;for(let t=0;t<steps;t++)v*=Math.exp(mu-.5*sig*sig+sig*normal());outcomes.push(v)}outcomes.sort((a,b)=>a-b);return{paths:outcomes.length,median:outcomes[Math.floor(outcomes.length*.5)],p05:outcomes[Math.floor(outcomes.length*.05)],p95:outcomes[Math.floor(outcomes.length*.95)]}}
 function riskOfRuin(winProb,winLossRatio,riskPerTrade,trades=100){let equity=1,p=n(winProb),r=Math.max(0,n(riskPerTrade));for(let i=0;i<trades;i++){equity*=p?1:1;if(p>=.5)break}const edge=p*n(winLossRatio)-(1-p);return{edge,riskPerTrade:r,flag:edge<=0||r>.05?"HIGH":"CONTROLLED"}}
 function stopTarget(entry,atr,direction="LONG",stopMult=1.5,targetMult=3){const e=n(entry),a=n(atr);return direction==="LONG"?{stop:e-a*stopMult,target:e+a*targetMult}:{stop:e+a*stopMult,target:e-a*targetMult}}
 function tradeQuality(x={}){const score=clamp(.2*n(x.probability,.5)+.15*n(x.calibration,.5)+.15*n(x.regime,.5)+.15*n(x.microstructure,.5)+.15*n(x.options,.5)+.1*n(x.institutional,.5)+.1*(1-n(x.risk,.5)),0,1);return{score,label:score>.75?"A":score>.6?"B":score>.45?"C":"D",action:score>.75?"TRADE":score>.6?"SMALLER SIZE":"WAIT"}}
 function capitalGate(x={}){const ok=n(x.drawdown,.0)<=n(x.maxDrawdown,.15)&&n(x.varRatio,0)<=1&&n(x.concentration,.0)<=n(x.maxConcentration,.3)&&n(x.riskOfRuin,.0)<.05;return{pass:ok,action:ok?"CAPITAL-OK":"CAPITAL-PRESERVATION",reasons:ok?[]:["drawdown/var/concentration/ruin gate"]}}
 function mean(a){return a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0}
 function sd(a){const m=mean(a);return Math.sqrt(mean(a.map(x=>(n(x)-m)**2)))}
 global.PortfolioRiskV780000={atrSize,fractionalKelly,volTargetSize,aggregateGreeks,covariance,correlation,cluster,parametricVaR,expectedShortfall,stress,monteCarlo,riskOfRuin,stopTarget,tradeQuality,capitalGate};
})(typeof globalThis!=="undefined"?globalThis:window);