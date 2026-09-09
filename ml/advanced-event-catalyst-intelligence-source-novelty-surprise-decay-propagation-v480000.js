/*
 V480000 ADVANCED EVENT / CATALYST INTELLIGENCE 2.0
 Feed-agnostic event normalization, deduplication, source credibility, novelty,
 severity, affected-entity mapping, propagation, surprise, half-life/decay,
 historical analogues, clustering, spillover and catalyst-to-F&O transmission.
 Decision support only; no autonomous trading.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;

 function normalizeEvent(e={}){return {id:e.id||e.guid||null,title:String(e.title||"").trim(),timestamp:e.timestamp||e.publishedAt||null,source:e.source||"UNKNOWN",sourceTier:e.sourceTier||"UNKNOWN",entities:[...(e.entities||[])],sector:e.sector||"UNKNOWN",country:e.country||null,type:e.type||"OTHER",expected:n(e.expected,null),actual:n(e.actual,null),text:e.text||""}}
 function dedupe(events=[]){const seen=new Map();for(const e of events){const x=normalizeEvent(e);const key=x.id||[x.title.toLowerCase(),x.source,x.timestamp].join("|");if(!seen.has(key))seen.set(key,x)}return [...seen.values()]}
 function sourceCredibility(sourceTier){return ({PRIMARY:1,REGULATORY:.98,EXCHANGE:.98,OFFICIAL:.95,TIER1:.9,TIER2:.75,SOCIAL:.4,UNKNOWN:.5}[sourceTier]??.5)}
 function novelty(event,history=[]){const title=String(event.title||"").toLowerCase();if(!history.length)return 1;const overlaps=history.map(h=>{const a=new Set(title.split(/\W+/).filter(Boolean)),b=new Set(String(h.title||"").toLowerCase().split(/\W+/).filter(Boolean));const inter=[...a].filter(x=>b.has(x)).length,union=new Set([...a,...b]).size;return union?inter/union:0});return clamp(1-mean(overlaps),0,1)}
 function surprise(expected,actual,scale=1){if(expected==null||actual==null)return {available:false,score:null};const gap=n(actual)-n(expected);return {available:true,gap,score:clamp(Math.abs(gap)/(Math.abs(n(expected))*scale+1e-9),0,1),direction:gap>0?"POSITIVE":gap<0?"NEGATIVE":"NEUTRAL"}}
 function severity(e={}){const base={MACRO:.9,GEOPOLITICAL:.95,REGULATORY:.85,EARNINGS:.8,GUIDANCE:.8,CORPORATE:.65,SECTOR:.65,OTHER:.35}[e.type]??.35;return clamp(.45*base+.25*n(e.materiality,.5)+.2*n(e.novelty,.5)+.1*n(e.sourceConfidence,.5),0,1)}
 function impactScore(e={}){return clamp(n(e.severity,.5)*n(e.novelty,.5)*(.5+.5*n(e.sourceConfidence,.5))*(.5+.5*n(e.surpriseScore,.5)),0,1)}
 function propagate(event,graph={}){const start=event.entities||[],seen=new Set(start),queue=start.map(x=>({x,d:0})),out=[];while(queue.length){const {x,d}=queue.shift();out.push({entity:x,distance:d});for(const y of (graph[x]||[])){if(!seen.has(y)&&d<3){seen.add(y);queue.push({x:y,d:d+1})}}}return out}
 function catalystHalfLife(type,severityScore){const base={GEOPOLITICAL:7,MACRO:5,REGULATORY:14,EARNINGS:3,GUIDANCE:4,CORPORATE:3,SECTOR:5,OTHER:2}[type]??2;return base*(.5+.5*clamp(n(severityScore,.5),0,1))}
 function decay(initial,ageDays,halfLife){return n(initial)*Math.pow(.5,n(ageDays)/Math.max(n(halfLife,1)))}
 function cluster(events=[]){const groups={};events.forEach(e=>{const k=[e.type||"OTHER",e.sector||"UNKNOWN",e.country||"GLOBAL"].join("|");(groups[k]??=[]).push(e)});return Object.entries(groups).map(([key,items])=>({key,count:items.length,events:items,clusterSeverity:mean(items.map(x=>n(x.severity,.5)))}))}
 function historicalAnalogue(event,history=[],limit=5){const target=String(event.title||"").toLowerCase().split(/\W+/).filter(Boolean);const scored=history.map(h=>{const b=String(h.title||"").toLowerCase().split(/\W+/).filter(Boolean);const bs=new Set(b);const sim=target.length?target.filter(x=>bs.has(x)).length/target.length:0;return {...h,similarity:sim}}).sort((a,b)=>b.similarity-a.similarity);return scored.slice(0,limit)}
 function spillover(event,macro={}){return {market:n(event.marketSensitivity,.5)*n(macro.marketRegimeMultiplier,1),sector:n(event.sectorSensitivity,.5),fx:n(event.fxSensitivity,.5),commodity:n(event.commoditySensitivity,.5),rates:n(event.rateSensitivity,.5)}}
 function fnoTransmission(e={}){const dir=n(e.surpriseSigned,0);const oi=n(e.oiSensitivity,.5),vol=n(e.volSensitivity,.5),price=n(e.priceSensitivity,.5);const score=clamp(Math.abs(dir)*(.4*price+.35*oi+.25*vol),0,1);return {score,direction:dir>0?"BULLISH":dir<0?"BEARISH":"NEUTRAL",channels:{price,oi,vol}}}
 function eventConfidence(e={}){return clamp(.2*n(e.sourceConfidence,.5)+.2*n(e.novelty,.5)+.2*n(e.severity,.5)+.2*n(e.surpriseScore,.5)+.2*n(e.transmissionScore,.5),0,1)}
 function analyzeEvent(e,history=[],graph={},macro={}){let x=normalizeEvent(e);x.sourceConfidence=sourceCredibility(x.sourceTier);x.novelty=novelty(x,history);const s=surprise(x.expected,x.actual);x.surpriseScore=s.score??0;x.surpriseDirection=s.direction||"UNKNOWN";x.severity=severity(x);x.impact=impactScore(x);x.propagation=propagate(x,graph);x.halfLifeDays=catalystHalfLife(x.type,x.severity);x.fno=fnoTransmission(x);x.spillover=spillover(x,macro);x.confidence=eventConfidence({...x,transmissionScore:x.fno.score});return x}
 global.CatalystIntelligenceV480000={normalizeEvent,dedupe,sourceCredibility,novelty,surprise,severity,impactScore,propagate,catalystHalfLife,decay,cluster,historicalAnalogue,spillover,fnoTransmission,eventConfidence,analyzeEvent};
})(typeof globalThis!=="undefined"?globalThis:window);
