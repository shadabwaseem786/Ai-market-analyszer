/*
 V140000 AI MARKET COUNCIL + MULTI-HORIZON FORECAST + CONSENSUS
 Decision-support only. Probabilities must be calibrated against historical outcomes.
 No automatic order execution.
*/
(function(global){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

 function agentVote(name,score,confidence,reason){
   return {name,score:clamp(n(score),-100,100),confidence:clamp(n(confidence,50),0,100),reason:reason||""};
 }
 function council(votes=[]){
   const w=votes.reduce((s,v)=>s+clamp(n(v.confidence,50),0,100),0)||1;
   const score=votes.reduce((s,v)=>s+n(v.score)*clamp(n(v.confidence,50),0,100),0)/w;
   const agreement=votes.length?100*Math.abs(votes.filter(v=>v.score>=0).length-votes.filter(v=>v.score<0).length)/votes.length:0;
   const decision=score>=25?"BUY":score<=-25?"SELL":"WAIT";
   return {score,agreement,decision,votes};
 }
 function multiHorizon(input={}){
   const horizons=["intraday","swing","positional"];
   const result={};
   horizons.forEach(h=>{
     const votes=(input[h]||[]).map(v=>agentVote(v.name,v.score,v.confidence,v.reason));
     result[h]=council(votes);
   });
   return result;
 }
 function calibrationGate(probability,calibrationError=0.05){
   const p=clamp(n(probability,.5),0,1);
   const e=clamp(n(calibrationError,.05),0,1);
   return {raw:p,adjusted:clamp(p*(1-e)+(0.5*e),0,1),error:e};
 }
 function finalCouncil(input={}){
   const horizons=multiHorizon(input.horizons||{});
   const weights={intraday:.3,swing:.4,positional:.3};
   let score=0,total=0;
   Object.keys(weights).forEach(h=>{score+=n(horizons[h].score)*weights[h];total+=weights[h]});
   score/=total||1;
   const confidence=clamp(n(input.confidence,50)*(0.5+n(input.agreement,50)/200),0,100);
   const redTeam=input.redTeamVerdict||"PASS";
   const decision=redTeam==="REJECT"?"NO-TRADE":score>=25?"BUY":score<=-25?"SELL":"WAIT";
   return {horizons,score,confidence,decision,redTeam};
 }
 global.MarketCouncilV140000={agentVote,council,multiHorizon,calibrationGate,finalCouncil};
})(typeof globalThis!=="undefined"?globalThis:window);
