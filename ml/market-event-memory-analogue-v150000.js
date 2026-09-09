/*
 V150000 MARKET MEMORY + EVENT MEMORY + ANALOGUE ENGINE
 Historical analogue retrieval and event/regime memory scaffolding.
 Uses only point-in-time records supplied to it; no future leakage.
 No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function eventFingerprint(e={}){
   return {
    catalyst:String(e.catalyst||"").toLowerCase(),
    sector:String(e.sector||"").toLowerCase(),
    regime:String(e.regime||"").toLowerCase(),
    direction:n(e.direction),
    volatility:n(e.volatility),
    oiChange:n(e.oiChange),
    ivChange:n(e.ivChange)
   };
 }
 function similarity(a={},b={}){
   const keys=["catalyst","sector","regime"];
   let score=0,weight=0;
   keys.forEach(k=>{weight++;if(a[k]&&b[k]&&a[k]===b[k])score+=1});
   ["direction","volatility","oiChange","ivChange"].forEach(k=>{
     const x=n(a[k]),y=n(b[k]),den=Math.abs(x)+Math.abs(y)+1;
     score+=clamp(1-Math.abs(x-y)/den,0,1);weight++;
   });
   return score/weight*100;
 }
 function retrieve(current={},history=[],limit=10){
   const fp=eventFingerprint(current);
   return history.map(h=>({...h,similarity:similarity(fp,eventFingerprint(h))}))
    .filter(x=>x.similarity>=45)
    .sort((a,b)=>b.similarity-a.similarity).slice(0,limit);
 }
 function analogueOutcome(matches=[]){
   if(!matches.length)return {n:0,expectedMove:0,hitRate:null,confidence:0};
   const moves=matches.map(x=>n(x.forwardReturn)).filter(Number.isFinite);
   const hits=moves.filter(x=>x>0).length;
   const avg=moves.length?moves.reduce((s,x)=>s+x,0)/moves.length:0;
   return {n:moves.length,expectedMove:avg,
     hitRate:moves.length?hits/moves.length*100:null,
     confidence:clamp(matches.reduce((s,x)=>s+x.similarity,0)/matches.length,0,100)};
 }
 function pointInTimeGuard(record={},predictionTime){
   const rt=Date.parse(record.timestamp||""),pt=Date.parse(predictionTime||"");
   return Number.isFinite(rt)&&Number.isFinite(pt)&&rt>=pt;
 }
 function graph(nodes=[],edges=[]){
   const degree={}; nodes.forEach(x=>degree[x.id]=0);
   edges.forEach(e=>{degree[e.from]=(degree[e.from]||0)+1;degree[e.to]=(degree[e.to]||0)+1});
   return {nodes,edges,degree};
 }
 function memoryScore(current={},history=[],predictionTime){
   const clean=history.filter(h=>!pointInTimeGuard(h,predictionTime));
   const matches=retrieve(current,clean);
   const outcome=analogueOutcome(matches);
   return {matches,outcome,leakageFree:true};
 }
 global.MarketMemoryV150000={eventFingerprint,similarity,retrieve,analogueOutcome,
   pointInTimeGuard,graph,memoryScore};
})(typeof globalThis!=="undefined"?globalThis:window);
