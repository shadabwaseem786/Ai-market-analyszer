/*
 V560000 EVENT / CATALYST INTELLIGENCE 2.0
 Credibility, deduplication, event clustering, propagation, half-life, surprise,
 reaction verification, escalation and change detection. Decision support only.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function credibility(e={}){const source=clamp(n(e.sourceQuality,.5),0,1),confirm=clamp(n(e.confirmation,.5),0,1),fresh=clamp(n(e.freshness,1),0,1),specific=clamp(n(e.specificity,.5),0,1);return clamp(.35*source+.25*confirm+.2*fresh+.2*specific,0,1)}
 function canonicalKey(e={}){return [String(e.type||"OTHER").toUpperCase(),String(e.country||"").toUpperCase(),String(e.entities?.[0]||e.symbol||"").toUpperCase(),String(e.date||"").slice(0,10)].join("|")}
 function deduplicate(events=[]){const seen=new Map(),out=[];for(const e of events){const k=e.canonicalKey||canonicalKey(e);if(!seen.has(k)){seen.set(k,{...e,count:1,sources:[e.source||"UNKNOWN"]});out.push(seen.get(k))}else{const x=seen.get(k);x.count++;if(e.source&&!x.sources.includes(e.source))x.sources.push(e.source);x.credibility=Math.max(n(x.credibility,0),credibility(e))}}return out}
 function cluster(events=[]){const g={};for(const e of events){const k=e.theme||e.type||"OTHER";g[k]??=[];g[k].push(e)}return Object.entries(g).map(([theme,items])=>({theme,count:items.length,events:items.map(x=>x.id||x.title),avgCredibility:items.length?items.reduce((s,x)=>s+credibility(x),0)/items.length:0}))}
 function surprise(expected,actual,scale=1){const e=n(expected),a=n(actual);return clamp(Math.abs(a-e)/(Math.abs(n(scale,1))+Math.abs(e)),0,1)}
 function halfLife(type="OTHER"){return ({EARNINGS:5,MACRO:24,GEOPOLITICAL:48,REGULATORY:72,CORPORATE:36,OTHER:24}[String(type).toUpperCase()]||24)}
 function decay(initial,ageHours,hl){return n(initial,0)*Math.pow(.5,Math.max(0,n(ageHours))/Math.max(1,n(hl,24)))}
 function propagate(event={},targets=[]){const intensity=clamp(n(event.impact,.5),0,1),dir=event.direction||"NEUTRAL";return targets.map(t=>({symbol:t.symbol||t.name,sector:t.sector||"UNKNOWN",direction:t.directionOverride||dir,intensity:clamp(intensity*n(t.sensitivity,.5),0,1),transmission:t.channel||"DIRECT"}))}
 function reaction(event={},market={}){const pre=n(market.prePrice),post=n(market.postPrice),move=pre?((post-pre)/pre):0;const expectedDir=event.direction==="BULLISH"?1:event.direction==="BEARISH"?-1:0;const signed=move*expectedDir;return {movePct:move*100,aligned:signed>0,unexpected:signed<0,magnitude:clamp(Math.abs(move)/.1,0,1)}}
 function escalation(events=[]){return events.map(e=>{const escalationScore=clamp(.35*n(e.credibility,.5)+.25*n(e.surprise,.5)+.2*n(e.impact,.5)+.2*n(e.confirmation,.5),0,1);return {...e,escalationScore,state:escalationScore>=.75?"ESCALATING":escalationScore<=.3?"DE-ESCALATING":"STABLE"}})}
 function changeDigest(previous=[],current=[]){const p=new Map(previous.map(x=>[x.id||x.canonicalKey,x])),c=new Map(current.map(x=>[x.id||x.canonicalKey,x]));return {newEvents:current.filter(x=>!p.has(x.id||x.canonicalKey)),removed:previous.filter(x=>!c.has(x.id||x.canonicalKey)),changed:current.filter(x=>p.has(x.id||x.canonicalKey)&&JSON.stringify(p.get(x.id||x.canonicalKey))!==JSON.stringify(x))}}
 function catalystScore(e={}){const cr=credibility(e),sp=clamp(n(e.surprise,.5),0,1),imp=clamp(n(e.impact,.5),0,1),rx=clamp(n(e.reactionConfirmation,.5),0,1);return clamp(.3*cr+.25*sp+.25*imp+.2*rx,0,1)}
 global.EventCatalystV560000={credibility,canonicalKey,deduplicate,cluster,surprise,halfLife,decay,propagate,reaction,escalation,changeDigest,catalystScore};
})(typeof globalThis!=="undefined"?globalThis:window);
