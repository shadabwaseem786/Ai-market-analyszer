/*
 V270000 PORTFOLIO INTELLIGENCE + CORRELATION/CONCENTRATION + DYNAMIC RISK
 Portfolio-level gate. Decision support only; no automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function correlationPenalty(corr=0){
   const c=clamp(Math.abs(n(corr)),0,1);
   return 1/(1+c);
 }
 function clusterRisk(positions=[]){
   if(!positions.length)return {gross:0,weighted:0,clusters:{}};
   const gross=positions.reduce((s,p)=>s+Math.abs(n(p.riskPct)),0);
   const clusters={};
   positions.forEach(p=>{
     const k=p.cluster||p.sector||"OTHER";
     clusters[k]=(clusters[k]||0)+Math.abs(n(p.riskPct));
   });
   const maxCluster=Math.max(...Object.values(clusters),0);
   return {gross,maxCluster,weighted:gross*(1+Math.max(0,maxCluster-gross*.35)/Math.max(gross,1)),clusters};
 }
 function portfolioHeat(positions=[]){
   return positions.reduce((s,p)=>s+Math.abs(n(p.riskPct)),0);
 }
 function avgCorrelation(matrix=[]){
   const vals=[];
   for(let i=0;i<matrix.length;i++)for(let j=i+1;j<matrix[i].length;j++)vals.push(Math.abs(n(matrix[i][j])));
   return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
 }
 function marginalRisk(candidate={},portfolio={}){
   const corr=clamp(Math.abs(n(candidate.avgCorrelation,0)),0,1);
   const base=Math.abs(n(candidate.riskPct));
   const penalty=correlationPenalty(corr);
   const factor=1+(corr*.75);
   return {baseRisk:base,correlation:corr,correlationAdjustedRisk:base*factor,diversificationFactor:penalty};
 }
 function dynamicBudget(x={}){
   const base=Math.max(0,n(x.baseBudgetPct,1));
   const dd=clamp(n(x.drawdownPct,0),0,100);
   const vol=clamp(n(x.volatilityScore,50),0,100);
   const confidence=clamp(n(x.confidence,50),0,100);
   const regime=x.regime||"NORMAL";
   let factor=1;
   if(dd>=10)factor*=.5; else if(dd>=5)factor*=.75;
   if(vol>=80)factor*=.5; else if(vol>=65)factor*=.75;
   if(confidence<55)factor*=.7; else if(confidence<70)factor*=.85;
   if(regime==="HIGH_VOL")factor*=.65;
   return {baseBudgetPct:base,adjustedBudgetPct:base*factor,factor};
 }
 function portfolioGate(x={}){
   const heat=portfolioHeat(x.positions||[]);
   const corr=avgCorrelation(x.correlationMatrix||[]);
   const cluster=clusterRisk(x.positions||[]);
   const marginal=marginalRisk(x.candidate||{},x);
   const budget=dynamicBudget(x);
   const totalAfter=heat+marginal.correlationAdjustedRisk;
   const maxHeat=n(x.maxPortfolioHeat,6);
   const maxCluster=n(x.maxClusterRisk,3);
   const veto=totalAfter>maxHeat||cluster.maxCluster>maxCluster||
     marginal.correlationAdjustedRisk>budget.adjustedBudgetPct;
   return {heat,corr,cluster,marginal,budget,totalRiskAfter:totalAfter,
     veto,decision:veto?"NO-TRADE":"PORTFOLIO-PASS"};
 }
 global.PortfolioRiskV270000={correlationPenalty,clusterRisk,portfolioHeat,avgCorrelation,marginalRisk,dynamicBudget,portfolioGate};
})(typeof globalThis!=="undefined"?globalThis:window);
