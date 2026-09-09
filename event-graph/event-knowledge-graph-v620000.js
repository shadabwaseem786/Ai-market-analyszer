/* V620000 EVENT KNOWLEDGE GRAPH + CATALYST PROPAGATION */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function node(id,type,props={}){return{id:String(id),type:String(type),props}}
 function edge(from,to,relation,confidence=.5,props={}){return{from,to,relation,confidence:clamp(n(confidence,.5),0,1),props}}
 function graph(nodes=[],edges=[]){const adj={};for(const e of edges)(adj[e.from]??=[]).push(e);return{nodes,edges,adj}}
 function neighbors(g,id,relation){return(g.adj?.[id]||[]).filter(e=>!relation||e.relation===relation).map(e=>e.to)}
 function propagate(g,eventId,maxDepth=3){const seen=new Set([eventId]),front=[{id:eventId,depth:0}],out=[];while(front.length){const {id,depth}=front.shift();if(depth>=maxDepth)continue;for(const e of g.adj?.[id]||[]){if(!seen.has(e.to)){seen.add(e.to);out.push({...e,depth:depth+1});front.push({id:e.to,depth:depth+1})}}}return out}
 function cascadeScore(paths=[]){let s=0;for(const p of paths)s+=n(p.confidence,.5)*Math.pow(.7,n(p.depth,1));return clamp(s,0,1)}
 function lifecycle(e={}){const age=n(e.ageHours,0),impact=clamp(n(e.impact,.5),0,1),confirm=clamp(n(e.confirmation,.5),0,1),half=Math.max(1,n(e.halfLifeHours,24));const decay=Math.pow(.5,age/half),score=impact*confirm*decay;return{decay,score,state:score>=.7?"ACTIVE":score>=.35?"PERSISTING":score>=.15?"FADING":"DORMANT"}}
 function analogueScore(a={},b={}){const keys=["type","theme","direction","regime","sector"];let m=0,t=0;for(const k of keys){if(a[k]!==undefined&&b[k]!==undefined){t++;if(String(a[k])===String(b[k]))m++}}return t?m/t:0}
 function findAnalogues(event={},history=[],threshold=.6){return history.map(h=>({...h,similarity:analogueScore(event,h)})).filter(x=>x.similarity>=threshold).sort((a,b)=>b.similarity-a.similarity)}
 function relationConfidence(evidence=[]){if(!evidence.length)return 0;let p=1;for(const e of evidence)p*=1-clamp(n(e,.5),0,1);return 1-p}
 function hypothesis(from,to,mechanism,evidence=[]){return{from,to,mechanism,evidence,confidence:relationConfidence(evidence),status:evidence.length>=2?"SUPPORTED_HYPOTHESIS":"UNCONFIRMED_HYPOTHESIS"}}
 function dedupEvents(events=[]){const m=new Map();for(const e of events){const k=e.fingerprint||[e.type,e.theme,e.country,e.symbol,e.date].join("|");if(!m.has(k))m.set(k,{...e,sources:[e.source].filter(Boolean),duplicates:0});else{const x=m.get(k);x.duplicates++;if(e.source&&!x.sources.includes(e.source))x.sources.push(e.source)}}return [...m.values()]}
 function clusterEvents(events=[]){const groups={};for(const e of events){const k=e.theme||e.type||"OTHER";groups[k]??=[];groups[k].push(e)}return Object.entries(groups).map(([theme,items])=>({theme,count:items.length,events:items.map(x=>x.id||x.title)}))}
 global.EventGraphV620000={node,edge,graph,neighbors,propagate,cascadeScore,lifecycle,analogueScore,findAnalogues,relationConfidence,hypothesis,dedupEvents,clusterEvents};
})(typeof globalThis!=="undefined"?globalThis:window);