/*
 V540000 EXPLAINABLE ORACLE + DECISION JOURNAL
 Evidence contribution, confidence decomposition, penalties, counterfactuals,
 decision timeline and performance attribution. Decision support only.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function contribution(items=[]){const total=items.reduce((s,x)=>s+Math.abs(n(x.effectiveWeight??x.weight,.1)),0)||1;return items.map(x=>({...x,contributionPct:100*Math.abs(n(x.effectiveWeight??x.weight,.1))/total}))}
 function confidenceDecomposition(parts={}){const base=clamp(n(parts.base,.5),0,1),quality=clamp(n(parts.quality,.5),0,1),freshness=clamp(n(parts.freshness,1),0,1),agreement=clamp(n(parts.agreement,.5),0,1),riskPenalty=clamp(n(parts.riskPenalty,0),0,1),executionPenalty=clamp(n(parts.executionPenalty,0),0,1);const raw=base*.4+quality*.2+freshness*.15+agreement*.25;return {base,quality,freshness,agreement,riskPenalty,executionPenalty,raw,final:clamp(raw*(1-riskPenalty)*(1-executionPenalty),0,1)}}
 function explain(result={}){const ev=contribution(result.evidence||[]).sort((a,b)=>Math.abs(n(b.score,.5)-.5)-Math.abs(n(a.score,.5)-.5));const positives=ev.filter(x=>x.direction==="BULLISH").slice(0,3),negatives=ev.filter(x=>x.direction==="BEARISH").slice(0,3);return {decision:result.action||result.decision||"WAIT",topPositive:positives.map(x=>({name:x.name,contributionPct:x.contributionPct,reason:x.reason})),topNegative:negatives.map(x=>({name:x.name,contributionPct:x.contributionPct,reason:x.reason})),riskGate:result.riskGate||null,conflict:result.conflict||null}}
 function counterfactual(result={},changes=[]){return changes.map(c=>({change:c.label||c.name,expectedDelta:n(c.delta,0),hypotheticalAction:c.hypotheticalAction||"RECALCULATE"}))}
 function whatWouldChange(result={}){const net=n(result.netScore,0),gap=Math.max(0,.22-Math.abs(net));return {current:result.action||"WAIT",decisionThreshold:.22,distanceToThreshold:gap,examples:gap?["material catalyst reversal","F&O positioning reversal","regime confirmation change","institutional-flow reversal"]:["decision already beyond threshold; reassess if risk gates fail"]}}
 function journalEvent(signalId,type,payload={}){return {eventId:"EVT-"+Date.now()+"-"+Math.random().toString(36).slice(2,7).toUpperCase(),signalId,type,timestamp:new Date().toISOString(),payload}}
 function timeline(events=[]){return [...events].sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp))}
 function attribution2(trades=[]){const by={};for(const t of trades){const keys={regime:t.regime||"UNKNOWN",model:t.modelVersion||"UNKNOWN",catalyst:t.catalystType||"UNKNOWN"};for(const [dim,key] of Object.entries(keys)){by[dim]??={};by[dim][key]??={count:0,pnl:0,wins:0};by[dim][key].count++;by[dim][key].pnl+=n(t.pnl);if(n(t.pnl)>0)by[dim][key].wins++}}for(const dim of Object.keys(by))for(const key of Object.keys(by[dim]))by[dim][key].winRate=by[dim][key].count?by[dim][key].wins/by[dim][key].count:0;return by}
 function decisionJournalRecord(result={},ctx={}){return {decisionId:result.decisionId||null,timestamp:result.timestamp||new Date().toISOString(),symbol:ctx.symbol||null,decision:result.action||result.decision||"WAIT",confidence:n(result.confidence,.5),netScore:n(result.netScore,0),explanation:explain(result),confidenceBreakdown:ctx.confidenceBreakdown||null,counterfactuals:counterfactual(result,ctx.counterfactuals||[]),whatWouldChange:whatWouldChange(result),modelVersion:ctx.modelVersion||null,regime:ctx.regime||null}}
 global.ExplainableOracleV540000={contribution,confidenceDecomposition,explain,counterfactual,whatWouldChange,journalEvent,timeline,attribution2,decisionJournalRecord};
})(typeof globalThis!=="undefined"?globalThis:window);
