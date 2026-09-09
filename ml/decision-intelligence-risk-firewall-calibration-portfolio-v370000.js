/*
 V370000 DECISION INTELLIGENCE + RISK FIREWALL
 Probability calibration, expected value, costs/slippage, liquidity, sizing,
 concentration, drawdown, circuit breakers and final decision gate.
 Research/decision-support only. No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function brier(y,p){const N=Math.min(y.length,p.length);if(!N)return null;let s=0;for(let i=0;i<N;i++){const q=clamp(n(p[i]),0,1);s+=(q-n(y[i]))**2}return s/N}
 function logLoss(y,p){const N=Math.min(y.length,p.length);if(!N)return null;let s=0;for(let i=0;i<N;i++){const q=clamp(n(p[i]),1e-6,1-1e-6);s+=-(n(y[i])*Math.log(q)+(1-n(y[i]))*Math.log(1-q))}return s/N}
 function calibrationBins(y,p,bins=10){
   const out=Array.from({length:bins},()=>({n:0,p:0,y:0}));
   for(let i=0;i<Math.min(y.length,p.length);i++){const q=clamp(n(p[i]),0,1),b=Math.min(bins-1,Math.floor(q*bins));out[b].n++;out[b].p+=q;out[b].y+=n(y[i])}
   return out.map((x,i)=>({...x,bin:i,meanPred:x.n?x.p/x.n:null,meanActual:x.n?x.y/x.n:null}));
 }
 function reliability(y,p,bins=10){return calibrationBins(y,p,bins).map(x=>({...x,gap:x.n?x.meanPred-x.meanActual:null}))}
 function expectedValue(probWin,avgWin,avgLoss,cost=0,slippage=0){return n(probWin)*n(avgWin)-(1-n(probWin))*Math.abs(n(avgLoss))-n(cost)-n(slippage)}
 function edge(probWin,benchmark=.5){return n(probWin)-n(benchmark)}
 function liquidityPenalty(spreadPct,advUtilization,impact=0){return clamp(1-n(spreadPct)*2-n(advUtilization)*.5-n(impact),0,1)}
 function kellyFraction(p,b){const q=1-n(p);return b>0?Math.max(0,(n(p)*b-q)/b):0}
 function positionSize(capital,riskPct,stopDistance,price,multiplier=1){const risk=capital*n(riskPct);return stopDistance>0?Math.floor(risk/(stopDistance*price*multiplier)):0}
 function concentration(positions=[]){
   const total=positions.reduce((s,x)=>s+Math.abs(n(x.exposure)),0)||1;
   return positions.map(x=>({...x,weight:Math.abs(n(x.exposure))/total})).sort((a,b)=>b.weight-a.weight);
 }
 function portfolioGuards(positions=[],limits={}){
   const p=concentration(positions), top=p[0]?.weight||0;
   const gross=p.reduce((s,x)=>s+Math.abs(n(x.exposure)),0);
   const maxName=n(limits.maxNameWeight,.25), maxGross=n(limits.maxGrossExposure,1);
   return {topWeight:top,grossExposure:gross,nameLimitBreached:top>maxName,grossLimitBreached:gross>maxGross,
     state:(top>maxName||gross>maxGross)?"BLOCK":"PASS"};
 }
 function drawdownGuard(equity=[],limits={}){
   if(!equity.length)return {drawdown:0,state:"PASS"};
   let peak=n(equity[0]),maxDD=0;equity.forEach(v=>{peak=Math.max(peak,n(v));maxDD=Math.max(maxDD,(peak-n(v))/(peak||1))});
   const hard=n(limits.hardDrawdown,.15),warn=n(limits.warningDrawdown,.08);
   return {drawdown:maxDD,state:maxDD>=hard?"BLOCK":maxDD>=warn?"REDUCE":"PASS"};
 }
 function circuitBreakers(ctx={}){
   const triggers=[];
   if(n(ctx.dataStalenessMinutes,0)>n(ctx.maxDataStalenessMinutes,5))triggers.push("STALE_DATA");
   if(n(ctx.slippagePct,0)>n(ctx.maxSlippagePct,.5))triggers.push("EXCESS_SLIPPAGE");
   if(n(ctx.spreadPct,0)>n(ctx.maxSpreadPct,1))triggers.push("WIDE_SPREAD");
   if(ctx.structuralBreak)triggers.push("STRUCTURAL_BREAK");
   if(ctx.modelDrift)triggers.push("MODEL_DRIFT");
   if(ctx.governanceFail)triggers.push("GOVERNANCE_FAIL");
   return {triggered:triggers.length>0,triggers,state:triggers.length?"BLOCK":"PASS"};
 }
 function finalGate(ctx={}){
   const ev=expectedValue(ctx.probability,ctx.avgWin,ctx.avgLoss,ctx.cost,ctx.slippage);
   const evPass=ev>n(ctx.minExpectedValue,0), conf=clamp(n(ctx.calibratedConfidence,n(ctx.probability,.5)),0,1);
   const liq=clamp(n(ctx.liquidityScore,1),0,1), risk=clamp(n(ctx.riskScore,0),0,1);
   const cb=circuitBreakers(ctx), pg=portfolioGuards(ctx.positions||[],ctx.portfolioLimits||{}), dd=drawdownGuard(ctx.equity||[],ctx.drawdownLimits||{});
   const pass=evPass&&conf>=n(ctx.minConfidence,.6)&&liq>=n(ctx.minLiquidity,.5)&&risk<=n(ctx.maxRisk,.6)&&!cb.triggered&&pg.state==="PASS"&&dd.state!=="BLOCK";
   let action="WAIT"; if(pass) action=n(ctx.probability)>=.5?"BUY":"SELL";
   if(!pass&&((cb.triggered)||pg.state==="BLOCK") ) action="NO-TRADE";
   return {action,expectedValue:ev,confidence:conf,liquidity:liq,riskScore:risk,
     expectedValuePass:evPass,circuitBreakers:cb,portfolio:pg,drawdown:dd,
     reason:action==="NO-TRADE"?"RISK_FIREWALL":action==="WAIT"?"INSUFFICIENT_EDGE":"RISK_ADJUSTED_EDGE"};
 }
 global.DecisionRiskV370000={brier,logLoss,calibrationBins,reliability,expectedValue,edge,liquidityPenalty,kellyFraction,positionSize,concentration,portfolioGuards,drawdownGuard,circuitBreakers,finalGate};
})(typeof globalThis!=="undefined"?globalThis:window);
