/* V790000 EXECUTION INTELLIGENCE + TRADE LIFECYCLE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function spread(mid,bid,ask){const m=Math.max(1e-9,n(mid));return{bid:n(bid),ask:n(ask),spread:n(ask)-n(bid),spreadPct:(n(ask)-n(bid))/m}}
 function slippage(expected,executed,side="BUY"){const e=n(expected),x=n(executed);return{absolute:side==="BUY"?x-e:e-x,pct:e?(side==="BUY"?(x-e)/e:(e-x)/e):0}}
 function liquidityScore(x={}){return clamp(.3*n(x.depth,.5)+.25*(1-clamp(n(x.spreadPct,.02)/.05,0,1))+.25*n(x.volumeRatio,.5)+.2*n(x.bookStability,.5),0,1)}
 function entryScore(x={}){const s=clamp(.2*n(x.signal,.5)+.2*n(x.calibration,.5)+.15*n(x.liquidity,.5)+.15*n(x.momentum,.5)+.15*n(x.options,.5)+.15*n(x.riskReward,.5),0,1);return{score:s,grade:s>.8?"A+":s>.68?"A":s>.55?"B":"WAIT"}}
 function executionMode(x={}){if(n(x.liquidity,.5)<.35||n(x.spreadPct,0)>.03)return"LIMIT";if(n(x.urgency,.5)>.75&&n(x.liquidity,.5)>.7)return"MARKETABLE-LIMIT";return"LIMIT"}
 function scalePlan(x={}){const total=Math.max(0,n(x.totalQty));const parts=x.parts||[.25,.25,.5];return parts.map((p,i)=>({stage:i+1,qty:Math.round(total*n(p)),trigger:x.triggers?.[i]||"confirmation"}))}
 function exitPlan(x={}){const dir=x.direction==="SHORT"?-1:1,e=n(x.entry),a=Math.max(0,n(x.atr)),stop=e-dir*a*n(x.stopMult,1.5),target=e+dir*a*n(x.targetMult,3);return{stop,target,trailStart:e+dir*a*n(x.trailStartMult,2),partialTarget:e+dir*a*n(x.partialTargetMult,1.5)}}
 function lifecycle(state="FLAT",event=""){const transitions={FLAT:["SIGNAL"],SIGNAL:["ENTRY_PENDING","CANCEL"],ENTRY_PENDING:["OPEN","CANCEL"],OPEN:["PARTIAL","EXIT_PENDING","STOP","TARGET"],PARTIAL:["OPEN","EXIT_PENDING","STOP","TARGET"],EXIT_PENDING:["CLOSED","CANCEL"],STOP:["CLOSED"],TARGET:["CLOSED"],CLOSED:["FLAT"]};return{state,event,allowed:(transitions[state]||[]).includes(event)}}
 function attribution(x={}){return{signalEdge:n(x.exitPrice)-n(x.entryPrice),slippage:n(x.slippage),fees:n(x.fees),marketImpact:n(x.marketImpact),timing:n(x.timing),netAfterCosts:n(x.grossPnl)-n(x.slippage)-n(x.fees)-n(x.marketImpact)}}
 function executionCost(x={}){const total=Math.abs(n(x.slippage))+Math.abs(n(x.fees))+Math.abs(n(x.marketImpact));return{total,ratio:n(x.notional)?total/n(x.notional):0}}
 function executionGate(x={}){const ok=n(x.entryScore,.5)>=.6&&n(x.liquidity,.5)>=.4&&n(x.slippagePct,0)<=n(x.maxSlippagePct,.01)&&!x.newsShock;return{pass:ok,action:ok?"EXECUTION-ELIGIBLE":"WAIT/CANCEL",reasons:ok?[]:["entry/liquidity/slippage/shock gate"]}}
 global.ExecutionV790000={spread,slippage,liquidityScore,entryScore,executionMode,scalePlan,exitPlan,lifecycle,attribution,executionCost,executionGate};
})(typeof globalThis!=="undefined"?globalThis:window);