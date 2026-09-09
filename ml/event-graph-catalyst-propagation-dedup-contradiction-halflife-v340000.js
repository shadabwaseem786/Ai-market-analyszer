/*
 V340000 EVENT GRAPH + CATALYST PROPAGATION 2.0
 Event normalization, deduplication, source reliability, contradiction detection,
 catalyst half-life / impact decay and temporal propagation graph.
 Research/decision-support only. No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
 const tokens=s=>new Set(norm(s).split(" ").filter(x=>x.length>2));
 function jaccard(a,b){const A=tokens(a),B=tokens(b);if(!A.size&&!B.size)return 1;let i=0;A.forEach(x=>{if(B.has(x))i++});return i/(A.size+B.size-i||1)}
 function deduplicate(events=[],threshold=.72){
   const kept=[],duplicates=[];
   events.slice().sort((a,b)=>(Date.parse(a.publishedAt)||0)-(Date.parse(b.publishedAt)||0)).forEach(e=>{
     const hit=kept.find(k=>Math.abs((Date.parse(e.publishedAt)||0)-(Date.parse(k.publishedAt)||0))<=n(e.dedupeWindowMs,3600000) &&
       (e.entity&&k.entity&&norm(e.entity)===norm(k.entity)) && jaccard(e.title,k.title)>=threshold);
     if(hit)duplicates.push({duplicate:e.id||e.title,canonical:hit.id||hit.title});
     else kept.push(e);
   });
   return {canonical:kept,duplicates,count:duplicates.length};
 }
 function reliability(source,profiles={}){
   const p=profiles[source]||{}; return clamp(n(p.reliabilityScore,.5),0,1);
 }
 function contradiction(events=[]){
   const pos=events.filter(e=>["positive","bullish","supportive"].includes(norm(e.polarity))).reduce((s,e)=>s+n(e.weight,1),0);
   const neg=events.filter(e=>["negative","bearish","adverse"].includes(norm(e.polarity))).reduce((s,e)=>s+n(e.weight,1),0);
   const total=pos+neg||1, balance=(pos-neg)/total;
   return {positive:pos,negative:neg,balance,contradictory:pos>0&&neg>0,state:Math.abs(balance)<.25?"CONFLICTED":balance>0?"BULLISH":"BEARISH"};
 }
 function decay(initialImpact,ageMs,halfLifeMs=86400000){
   return n(initialImpact,0)*Math.pow(.5,Math.max(0,n(ageMs))/Math.max(1,n(halfLifeMs)));
 }
 function propagation(event={},edges=[],now=event.publishedAt){
   const age=Math.max(0,(Date.parse(now)||0)-(Date.parse(event.publishedAt)||0));
   return edges.map(e=>({...e,impact:decay(n(event.intensity,1)*n(e.weight,0),age,n(event.halfLifeMs,86400000)),
     lagMs:n(e.lagMs,0)})).filter(e=>Math.abs(e.impact)>.05).sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact));
 }
 function graph(events=[],edges=[],profiles={}){
   const d=deduplicate(events), nodes=[], links=[];
   d.canonical.forEach(e=>{
     nodes.push({id:e.id||e.title,type:"EVENT",entity:e.entity||null,source:e.source||"UNKNOWN",
       reliability:reliability(e.source,profiles),publishedAt:e.publishedAt,halfLifeMs:e.halfLifeMs||86400000});
   });
   edges.forEach(e=>links.push({from:e.from,to:e.to,weight:n(e.weight,0),lagMs:n(e.lagMs,0),relation:e.relation||"ASSOCIATED"}));
   return {nodes,links,dedup:d.duplicates};
 }
 function catalystScore(event={},sources=[],related=[]){
   const src=sources.map(s=>reliability(s.source,s.profiles||{}));
   const srcScore=src.length?src.reduce((a,b)=>a+b,0)/src.length:.5;
   const novelty=clamp(n(event.novelty,.5),0,1), specificity=clamp(n(event.specificity,.5),0,1);
   const contradiction=contradiction(related);
   const conflictPenalty=contradiction.contradictory?.7:1;
   return {score:clamp(n(event.intensity,1)*srcScore*novelty*specificity*conflictPenalty,0,1),
     sourceReliability:srcScore,novelty,specificity,contradiction};
 }
 global.EventGraphV340000={jaccard,deduplicate,reliability,contradiction,decay,propagation,graph,catalystScore};
})(typeof globalThis!=="undefined"?globalThis:window);
