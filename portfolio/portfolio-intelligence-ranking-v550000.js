/*
 V550000 PORTFOLIO INTELLIGENCE + OPPORTUNITY RANKING
 Universe scanning, ranking, sector rotation, correlation clustering, duplicate suppression,
 exposure/risk budget and portfolio-level decision support. No order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;

 function opportunityScore(x={}) {
   const catalyst=clamp(n(x.catalyst,.5),0,1), fno=clamp(n(x.fno,.5),0,1),
         breadth=clamp(n(x.breadth,.5),0,1), flow=clamp(n(x.flow,.5),0,1),
         model=clamp(n(x.model,.5),0,1), robustness=clamp(n(x.robustness,.5),0,1),
         regime=clamp(n(x.regime,.5),0,1), risk=clamp(n(x.risk,.5),0,1);
   const raw=.16*catalyst+.16*fno+.10*breadth+.14*flow+.18*model+.10*robustness+.08*regime+.08*risk;
   return {score:clamp(raw,0,1), components:{catalyst,fno,breadth,flow,model,robustness,regime,risk}};
 }
 function rankUniverse(rows=[]) {
   return rows.map(x=>({...x,opportunity:opportunityScore(x).score})).sort((a,b)=>b.opportunity-a.opportunity)
 }
 function sectorRotation(rows=[]) {
   const g={};
   for(const x of rows){const s=x.sector||"UNKNOWN";g[s]??=[];g[s].push(n(x.returnScore,.5))}
   return Object.entries(g).map(([sector,v])=>({sector,score:mean(v),members:v.length,state:mean(v)>=.65?"LEADING":mean(v)<=.35?"LAGGING":"NEUTRAL"})).sort((a,b)=>b.score-a.score)
 }
 function corr(a=[],b=[]){const m=Math.min(a.length,b.length);if(m<2)return 0;const aa=a.slice(0,m),bb=b.slice(0,m),ma=mean(aa),mb=mean(bb);let num=0,da=0,db=0;for(let i=0;i<m;i++){const x=n(aa[i])-ma,y=n(bb[i])-mb;num+=x*y;da+=x*x;db+=y*y}return num/Math.sqrt((da||1)*(db||1))}
 function correlationClusters(items=[],threshold=.75){
   const clusters=[];const used=new Set();
   for(let i=0;i<items.length;i++){if(used.has(i))continue;const c=[items[i]];used.add(i);for(let j=i+1;j<items.length;j++)if(!used.has(j)&&Math.abs(corr(items[i].returns||[],items[j].returns||[]))>=threshold){c.push(items[j]);used.add(j)}clusters.push(c)}
   return clusters.map((c,i)=>({cluster:i+1,members:c.map(x=>x.symbol),size:c.length}));
 }
 function suppressDuplicates(signals=[],maxPerCluster=1){
   const counts={};return signals.map(s=>{const k=s.clusterId||s.sector||"UNKNOWN";counts[k]=(counts[k]||0)+1;return {...s,suppressed:counts[k]>maxPerCluster,suppressionReason:counts[k]>maxPerCluster?"DUPLICATE_EXPOSURE":null}})
 }
 function exposure(positions=[]){
   const gross=positions.reduce((s,p)=>s+Math.abs(n(p.notional)),0), net=positions.reduce((s,p)=>s+n(p.notional),0);
   const bySector={};for(const p of positions){const k=p.sector||"UNKNOWN";bySector[k]=(bySector[k]||0)+Math.abs(n(p.notional))}
   return {gross,net,bySector,largestSector:Object.entries(bySector).sort((a,b)=>b[1]-a[1])[0]||null};
 }
 function riskBudget(capital=0,limits={}){
   return {capital:n(capital),maxGross:n(capital)*n(limits.maxGrossPct,.8),maxNet:n(capital)*n(limits.maxNetPct,.5),perPosition:n(capital)*n(limits.perPositionPct,.1),perSector:n(capital)*n(limits.perSectorPct,.25)};
 }
 function positionSize(p={}) {
   const capital=n(p.capital), riskPct=clamp(n(p.riskPct,.01),0,.05), entry=n(p.entry), stop=n(p.stop), unitRisk=Math.abs(entry-stop);
   const riskCapital=capital*riskPct;
   return {riskCapital,unitRisk,quantity:unitRisk>0?Math.floor(riskCapital/unitRisk):0};
 }
 function portfolioDecision(p={}) {
   const exposurePct=clamp(n(p.grossExposurePct,0),0,2), concentration=clamp(n(p.concentration,.0),0,1),
         opportunity=clamp(n(p.opportunity,.5),0,1), riskGate=p.riskGate!==false;
   if(!riskGate||concentration>.8||exposurePct>1) return {decision:"NO-TRADE",reason:"PORTFOLIO_RISK_GATE"};
   if(opportunity>=.7)return {decision:"BUY",reason:"HIGH_OPPORTUNITY"};
   if(opportunity<=.3)return {decision:"SELL",reason:"LOW_OPPORTUNITY"};
   return {decision:"WAIT",reason:"INSUFFICIENT_EDGE"};
 }
 function shortlist(rows=[],topN=10){return rankUniverse(rows).slice(0,topN)}
 global.PortfolioIntelligenceV550000={opportunityScore,rankUniverse,sectorRotation,corr,correlationClusters,suppressDuplicates,exposure,riskBudget,positionSize,portfolioDecision,shortlist};
})(typeof globalThis!=="undefined"?globalThis:window);
