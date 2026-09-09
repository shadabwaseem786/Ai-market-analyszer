/*
 V160000 REAL-TIME OPPORTUNITY SCANNER + SIGNAL RANKING
 Decision-support scanner. Uses supplied market records only.
 No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const score=(x,w)=>n(x)*n(w,1);

 function opportunityScore(x={}){
   const components={
    momentum:score(x.momentum,.15),
    trend:score(x.trend,.15),
    volume:score(x.volume,.10),
    oi:score(x.oi,.10),
    options:score(x.options,.10),
    catalyst:score(x.catalyst,.15),
    regime:score(x.regime,.10),
    memory:score(x.memory,.05),
    council:score(x.council,.10)
   };
   const raw=Object.values(components).reduce((a,b)=>a+b,0);
   const riskPenalty=n(x.riskPenalty,0)+n(x.conflictPenalty,0)+n(x.driftPenalty,0);
   return {components,raw,score:clamp(raw-riskPenalty,-100,100),riskPenalty};
 }

 function gate(x={}){
   if(x.dataState && x.dataState!=="LIVE")return {pass:false,reason:"DATA_NOT_LIVE"};
   if(x.redTeam==="REJECT")return {pass:false,reason:"RED_TEAM_REJECT"};
   if(x.liquidityBlocked)return {pass:false,reason:"LIQUIDITY_BLOCK"};
   if(n(x.confidence)<n(x.minConfidence,60))return {pass:false,reason:"LOW_CONFIDENCE"};
   return {pass:true,reason:"PASS"};
 }

 function scan(records=[],limit=10){
   return records.map(x=>{
     const s=opportunityScore(x),g=gate({...x,confidence:n(x.confidence,s.score)});
     const direction=s.score>=25?"BUY":s.score<=-25?"SELL":"WAIT";
     return {...x,opportunity:s,gated:g,decision:g.pass?direction:"NO-TRADE"};
   }).sort((a,b)=>Math.abs(b.opportunity.score)-Math.abs(a.opportunity.score)).slice(0,limit);
 }

 function rank(records=[]){
   return scan(records,records.length).map((x,i)=>({...x,rank:i+1}));
 }

 global.OpportunityScannerV160000={opportunityScore,gate,scan,rank};
})(typeof globalThis!=="undefined"?globalThis:window);
