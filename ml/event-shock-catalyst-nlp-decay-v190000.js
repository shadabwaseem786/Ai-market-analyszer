/*
 V190000 EVENT SHOCK + CATALYST GRAPH + NLP IMPACT + DECAY
 Decision-support layer. Text scores are heuristic unless replaced by a validated NLP model.
 No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const pos=/upgrade|beat|growth|approval|order|acquire|buyback|dividend|positive|strong|partnership|capex/gi;
 const neg=/miss|downgrade|fraud|ban|probe|delay|loss|default|war|sanction|negative|weak|cut|recall/gi;

 function sentiment(text=""){
   const p=(String(text).match(pos)||[]).length, q=(String(text).match(neg)||[]).length;
   const total=p+q||1;
   return {positive:p,negative:q,score:clamp((p-q)/total*100,-100,100)};
 }
 function severity(x={}){
   const surprise=Math.abs(n(x.surprise))*25;
   const reach=n(x.marketReach,50);
   const certainty=n(x.certainty,50);
   return clamp(.45*surprise+.3*reach+.25*certainty,0,100);
 }
 function decay(initial,ageHours,halfLifeHours=24){
   return clamp(n(initial)*Math.pow(.5,Math.max(0,n(ageHours))/Math.max(1,n(halfLifeHours))),0,100);
 }
 function affectedGraph(event={},entities=[]){
   const root={id:event.id||"EVENT",type:"event",name:event.title||"event"};
   const nodes=[root],edges=[];
   entities.forEach(e=>{
     const id=e.id||e.symbol||e.name;
     if(!id)return;
     nodes.push({id,type:e.type||"security",name:e.name||id});
     edges.push({from:root.id,to:id,relation:e.relation||"AFFECTS",weight:clamp(n(e.weight,50),0,100)});
   });
   return {nodes,edges};
 }
 function shockScore(event={}){
   const s=sentiment(event.text||event.headline||"");
   const sev=severity(event);
   const dec=decay(sev,n(event.ageHours),n(event.halfLifeHours,24));
   const direction=s.score>=15?"BULLISH":s.score<=-15?"BEARISH":"MIXED";
   return {sentiment:s,severity:sev,decayedImpact:dec,direction,
     shock:clamp(dec*(.5+Math.abs(s.score)/200),0,100)};
 }
 function catalystGate(event={}){
   const s=shockScore(event);
   const verified=event.verified!==false;
   return {verified,shock:s.shock,direction:s.direction,
     actionable:verified&&s.shock>=55&&s.direction!=="MIXED",
     reason:!verified?"UNVERIFIED":s.shock<55?"LOW_IMPACT":s.direction==="MIXED"?"MIXED_SIGNAL":"PASS"};
 }
 function eventImpact(event={},entities=[]){
   return {shock:shockScore(event),graph:affectedGraph(event,entities),
     gate:catalystGate(event)};
 }
 global.EventShockV190000={sentiment,severity,decay,affectedGraph,shockScore,catalystGate,eventImpact};
})(typeof globalThis!=="undefined"?globalThis:window);
