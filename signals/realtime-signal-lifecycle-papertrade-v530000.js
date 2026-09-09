/*
 V530000 REAL-TIME SIGNAL + PAPER-TRADING INTELLIGENCE
 Signal lifecycle, snapshots, entry/exit references, alert priority, outcome attribution,
 trade-quality scoring and journal reconciliation. No broker execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const now=()=>new Date().toISOString();

 function createSignal(s={}){return {signalId:s.signalId||"SIG-"+Date.now()+"-"+Math.random().toString(36).slice(2,7).toUpperCase(),symbol:s.symbol||"",instrument:s.instrument||"EQUITY",decision:s.decision||"WAIT",confidence:clamp(n(s.confidence,.5),0,1),entryRef:n(s.entryRef),stopRef:n(s.stopRef),targetRef:n(s.targetRef),createdAt:s.createdAt||now(),status:"ACTIVE",modelVersion:s.modelVersion||"UNKNOWN",regime:s.regime||"UNKNOWN",catalystId:s.catalystId||null}}
 function snapshot(signal,market={}){return {signalId:signal.signalId,timestamp:now(),ltp:n(market.ltp),bid:n(market.bid),ask:n(market.ask),volume:n(market.volume),oi:n(market.oi),decision:signal.decision,confidence:signal.confidence}}
 function updateLifecycle(signal,event={}){const next={...signal};if(event.type==="ENTER")next.status="ENTERED";if(event.type==="EXIT")next.status="CLOSED";if(event.type==="INVALIDATE")next.status="INVALIDATED";next.lastEvent=event;next.updatedAt=now();return next}
 function pnl(direction,entry,exit,qty=1){const d=direction==="SELL"?-1:1;return (n(exit)-n(entry))*d*n(qty)}
 function outcome(signal,market={}){const exit=n(market.exit||market.ltp);const entry=n(signal.entryRef);const p=pnl(signal.decision,entry,exit,n(market.qty,1));const risk=Math.abs(entry-n(signal.stopRef))||1;return {signalId:signal.signalId,entry,exit,pnl:p,returnR: p/risk,outcome:p>0?"WIN":p<0?"LOSS":"FLAT",holdingMs:Math.max(0,new Date(market.timestamp||now())-new Date(signal.createdAt))}}
 function alertPriority(a={}){const score=clamp(.35*n(a.impact,.5)+.25*n(a.confidence,.5)+.2*n(a.urgency,.5)+.2*n(a.risk,.5),0,1);return {score,priority:score>=.8?"CRITICAL":score>=.6?"HIGH":score>=.4?"MEDIUM":"LOW"}}
 function shouldAlert(signal={},ctx={}){const triggers=[];if(ctx.decisionChanged)triggers.push("DECISION_CHANGE");if(ctx.confidenceDrop)n(ctx.confidenceDrop)>n(ctx.confidenceDropThreshold,.15)&&triggers.push("CONFIDENCE_DROP");if(ctx.stopThreat)triggers.push("STOP_THREAT");if(ctx.targetHit)triggers.push("TARGET_HIT");if(ctx.catalystShock)triggers.push("CATALYST_SHOCK");if(ctx.regimeTransition)triggers.push("REGIME_TRANSITION");return {alert:triggers.length>0,triggers,priority:alertPriority(ctx).priority}}
 function tradeQuality(t={}){const rr=n(t.reward)/Math.max(Math.abs(n(t.risk)),1e-9),slip=1-clamp(n(t.slippagePct)/1,0,1),liq=clamp(n(t.liquidityScore,.5),0,1),conf=clamp(n(t.confidence,.5),0,1);return {score:clamp(.3*clamp(rr/3,0,1)+.25*slip+.2*liq+.25*conf,0,1),rr}}
 function attribution(trades=[]){const groups={};for(const t of trades){const k=t.regime||"UNKNOWN";(groups[k]??=[]).push(t)}return Object.entries(groups).map(([regime,items])=>({regime,count:items.length,pnl:items.reduce((s,x)=>s+n(x.pnl),0),winRate:items.length?items.filter(x=>n(x.pnl)>0).length/items.length:0,expectancy:items.length?items.reduce((s,x)=>s+n(x.pnl),0)/items.length:0}))}
 function reconcile(journal=[],outcomes=[]){const map=new Map(outcomes.map(x=>[x.signalId,x]));return journal.map(x=>({...x,reconciled:map.has(x.signalId),outcome:map.get(x.signalId)||null}))}
 function staleSignals(signals=[],maxAgeMs=3600000,ts=Date.now()){return signals.filter(s=>s.status==="ACTIVE"&&(ts-new Date(s.updatedAt||s.createdAt).getTime())>maxAgeMs).map(s=>s.signalId)}
 global.SignalIntelligenceV530000={createSignal,snapshot,updateLifecycle,pnl,outcome,alertPriority,shouldAlert,tradeQuality,attribution,reconcile,staleSignals};
})(typeof globalThis!=="undefined"?globalThis:window);
