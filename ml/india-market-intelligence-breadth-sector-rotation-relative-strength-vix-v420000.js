/*
 V420000 INDIA MARKET INTELLIGENCE + BREADTH ENGINE
 Breadth, sector rotation, relative strength, participation, F&O confirmation,
 volatility regime and market-wide risk scoring. Feed-agnostic; no execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 const sum=a=>a.reduce((s,x)=>s+n(x),0);

 function breadth(stocks=[]){
   const a=stocks.filter(x=>n(x.changePct,0)>0).length,d=stocks.filter(x=>n(x.changePct,0)<0).length,u=stocks.filter(x=>n(x.changePct,0)===0).length,t=a+d+u||1;
   return {advancers:a,decliners:d,unchanged:u,advanceDeclineRatio:d?a/d:null,advancePct:a/t,declinePct:d/t,netBreadth:(a-d)/t};
 }
 function breadthThrust(history=[]){
   const vals=history.map(x=>clamp(n(x.advancePct),0,1)).filter(Number.isFinite);
   if(!vals.length)return {score:null,state:"NO_DATA"};
   const score=mean(vals.slice(-10));
   return {score,state:score>=.615?"THRUST":score<=.385?"WEAK":"NEUTRAL"};
 }
 function sectorRotation(sectors=[]){
   return sectors.map(s=>({...s,relativeScore:n(s.returnPct)-n(s.marketReturnPct),leadership:(n(s.returnPct)-n(s.marketReturnPct))>0?"LEADING":"LAGGING"}))
     .sort((a,b)=>n(b.relativeScore)-n(a.relativeScore));
 }
 function relativeStrength(assetReturn,benchmarkReturn){return {excessReturn:n(assetReturn)-n(benchmarkReturn),ratio:n(benchmarkReturn)?n(assetReturn)/n(benchmarkReturn):null}}
 function participation(stocks=[]){
   const t=stocks.length||1;
   return {aboveVWAP:stocks.filter(x=>x.aboveVWAP).length/t,aboveMA50:stocks.filter(x=>x.aboveMA50).length/t,
     aboveMA200:stocks.filter(x=>x.aboveMA200).length/t,newHighs:stocks.filter(x=>x.newHigh).length,newLows:stocks.filter(x=>x.newLow).length};
 }
 function vixRegime(vix,history=[]){
   const x=n(vix),m=mean(history),z=history.length>2?(x-m)/(Math.sqrt(mean(history.map(q=>(n(q)-m)**2)))||1):0;
   return {vix:x,z,state:x>=30?"PANIC":x>=20?"ELEVATED":x<13?"CALM":"NORMAL"};
 }
 function indexParticipation(constituents=[],indexChangePct=0){
   const b=breadth(constituents),p=participation(constituents),weighted=mean(constituents.map(x=>n(x.weightedContributionPct,0)));
   return {...b,...p,weightedContribution:weighted,indexChangePct:n(indexChangePct),
     divergence:(n(indexChangePct)>0&&b.netBreadth<-.1)||(n(indexChangePct)<0&&b.netBreadth>.1)};
 }
 function sectorConcentration(sectors=[]){
   const vals=sectors.map(s=>Math.abs(n(s.weightedContributionPct,0))),t=sum(vals)||1;
   return sectors.map((s,i)=>({...s,contributionWeight:vals[i]/t})).sort((a,b)=>b.contributionWeight-a.contributionWeight);
 }
 function marketRiskScore(ctx={}){
   const breadthRisk=clamp((.5-n(ctx.netBreadth,.0)),0,1),vixRisk=clamp((n(ctx.vix,15)-13)/25,0,1);
   const div=ctx.divergence?.length?1:0, concentration=clamp(n(ctx.sectorConcentrationRisk,0),0,1);
   return clamp(.35*breadthRisk+.3*vixRisk+.2*div+.15*concentration,0,1);
 }
 function fnoBreadthConfirmation(ctx={}){
   const market=clamp((n(ctx.breadth,.5)+n(ctx.fnoParticipation,.5)+n(ctx.sectorAlignment,.5))/3,0,1);
   return {score:market,state:market>=.67?"CONFIRMED":market<=.4?"CONTRARY":"MIXED"};
 }
 global.IndiaMarketV420000={breadth,breadthThrust,sectorRotation,relativeStrength,participation,vixRegime,indexParticipation,sectorConcentration,marketRiskScore,fnoBreadthConfirmation};
})(typeof globalThis!=="undefined"?globalThis:window);
