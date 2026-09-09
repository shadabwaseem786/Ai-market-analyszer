/*
 V280000 MONTE CARLO + STRESS + REGIME DRAWDOWN ENGINE
 Simulation/stress layer. Outputs are conditional model scenarios, not forecasts.
 No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function pct(a,p){
   if(!a.length)return 0;
   const s=[...a].sort((x,y)=>x-y), i=(s.length-1)*p, lo=Math.floor(i), hi=Math.ceil(i);
   return s[lo]+(s[hi]-s[lo])*(i-lo);
 }
 function normal(rng){
   let u=0,v=0; while(!u)u=rng(); while(!v)v=rng();
   return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
 }
 function simulate(returns=[],opts={}){
   const sims=Math.max(100,n(opts.simulations,1000)), steps=Math.max(1,n(opts.steps,100));
   const seed=n(opts.seed,280000)||280000, rng=(()=>{let a=seed>>>0;return()=>((a=(1664525*a+1013904223)>>>0)/4294967296)})();
   const r=returns.map(Number).filter(Number.isFinite);
   const mu=r.length?r.reduce((a,b)=>a+b,0)/r.length:0;
   const sd=r.length?Math.sqrt(r.reduce((s,x)=>s+(x-mu)**2,0)/Math.max(1,r.length-1)):0.01;
   const terminal=[], maxdd=[];
   for(let k=0;k<sims;k++){
     let equity=1,peak=1,dd=0;
     for(let t=0;t<steps;t++){
       const shock=normal(rng);
       equity*=Math.max(.0001,1+mu+sd*shock);
       peak=Math.max(peak,equity); dd=Math.min(dd,equity/peak-1);
     }
     terminal.push(equity-1); maxdd.push(dd);
   }
   return {simulations:sims,steps,meanReturn:terminal.reduce((a,b)=>a+b,0)/sims,
     p05Return:pct(terminal,.05),p50Return:pct(terminal,.5),p95Return:pct(terminal,.95),
     p95Drawdown:pct(maxdd,.05),medianDrawdown:pct(maxdd,.5),worstDrawdown:Math.min(...maxdd)};
 }
 function stressScenarios(base={},scenarios=[]){
   return scenarios.map(s=>{
     const priceShock=n(s.priceShock), volShock=Math.max(0,n(s.volShock));
     const corrShock=clamp(n(s.correlationShock,0),-1,1);
     const liquidityShock=clamp(n(s.liquidityShock,0),0,1);
     const impact=priceShock*(1+volShock*.25+Math.abs(corrShock)*.25);
     const execution=liquidityShock*Math.max(0,n(base.exposure,1))*.05;
     return {...s,conditionalLossPct:-(Math.abs(impact)+execution)*100};
   });
 }
 function riskOfRuin(trades=[],riskPerTrade=.01,ruinDrawdown=.5){
   const r=trades.map(Number).filter(Number.isFinite);
   if(!r.length)return {probability:null,method:"INSUFFICIENT_DATA"};
   let losses=0,wins=0;
   r.forEach(x=>x<0?losses++:wins++);
   const p=losses/r.length, q=1-p;
   const unit=Math.max(.0001,n(riskPerTrade,.01));
   const target=Math.max(unit,n(ruinDrawdown,.5));
   if(p===0)return {probability:0,method:"EMPIRICAL_SIMPLE"};
   if(q===0)return {probability:1,method:"EMPIRICAL_SIMPLE"};
   const capitalUnits=Math.max(1,Math.floor(target/unit));
   const odds=p/q;
   return {probability:clamp(odds**capitalUnits,0,1),method:"EMPIRICAL_SIMPLE",lossRate:p};
 }
 function regimeStress(x={}){
   const vol=clamp(n(x.volatilityScore,50),0,100);
   const corr=clamp(n(x.correlationStress,0),0,1);
   const gap=clamp(n(x.gapRisk,0),0,1);
   const liquidity=clamp(n(x.liquidityStress,0),0,1);
   const severity=clamp(.35*vol+.25*corr*100+.20*gap*100+.20*liquidity*100,0,100);
   return {severity,label:severity>=80?"CRISIS":severity>=60?"STRESS":severity>=35?"ELEVATED":"NORMAL"};
 }
 function stressGate(x={}){
   const mc=simulate(x.returns||[],x.simulation||{});
   const stress=stressScenarios(x.base||{},x.scenarios||[]);
   const regime=regimeStress(x.regime||{});
   const ruin=riskOfRuin(x.trades||[],x.riskPerTrade,x.ruinDrawdown);
   const veto=regime.label==="CRISIS" || mc.worstDrawdown<=-Math.abs(n(x.maxDrawdownLimit,.25)) ||
     (ruin.probability!==null && ruin.probability>=n(x.maxRuinProbability,.05));
   return {monteCarlo:mc,stress,regime,ruin,veto,decision:veto?"RISK-OFF":"STRESS-PASS"};
 }
 global.StressEngineV280000={simulate,stressScenarios,riskOfRuin,regimeStress,stressGate};
})(typeof globalThis!=="undefined"?globalThis:window);
