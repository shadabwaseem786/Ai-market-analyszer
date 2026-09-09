/*
 V500000 MASTER ORACLE DECISION FUSION
 Fuses evidence from catalyst, F&O, breadth, institutional flow, ensemble,
 robustness, portfolio risk, microstructure and regime engines.
 Produces auditable BUY/SELL/WAIT/NO-TRADE, calibrated confidence, conflict
 resolution, evidence trail and Newbie/Expert presentation payloads.
 Decision support only; no broker execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 const dir=v=>n(v)>0?"BULLISH":n(v)<0?"BEARISH":"NEUTRAL";

 const DEFAULT_WEIGHTS={catalyst:.14,fno:.14,breadth:.10,institutional:.12,ensemble:.18,robustness:.10,risk:.08,microstructure:.06,regime:.08};

 function normalizeEvidence(e={}){return {name:e.name||"UNKNOWN",score:clamp(n(e.score,.5),0,1),direction:e.direction||"NEUTRAL",confidence:clamp(n(e.confidence,.5),0,1),quality:clamp(n(e.quality,.5),0,1),freshness:clamp(n(e.freshness,1),0,1),reason:e.reason||""}}
 function weightedFusion(evidence=[],weights=DEFAULT_WEIGHTS){let bull=0,bear=0,total=0,items=[];for(const raw of evidence){const e=normalizeEvidence(raw),w=n(weights[e.name.toLowerCase()],n(e.weight,.1));const q=w*e.confidence*e.quality*e.freshness;total+=q;const signed=e.direction==="BULLISH"?1:e.direction==="BEARISH"?-1:0;bull+=q*(e.score-.5)*2*signed;items.push({...e,weight:w,effectiveWeight:q})}const net=total?bull/total:0;return {netScore:net,confidence:clamp(.5+Math.abs(net)*.5,0,1),bullScore:clamp(.5+Math.max(net,0),0,1),bearScore:clamp(.5+Math.max(-net,0),0,1),items}}
 function conflictResolution(fusion,ctx={}){const gap=Math.abs(n(fusion.netScore));const conflicts=(fusion.items||[]).filter(x=>x.direction!=="NEUTRAL"&&x.effectiveWeight>0).length;const strong=(fusion.items||[]).filter(x=>x.direction==="BULLISH"&&x.score>.75).length-(fusion.items||[]).filter(x=>x.direction==="BEARISH"&&x.score>.75).length;return {conflictIndex:clamp(1-gap,0,1),conflictingSources:conflicts,strongNet:strong,requiresCaution:gap<.2||n(ctx.regimeConfidence,.5)<.5}}
 function riskGate(ctx={}){const blocks=[];if(ctx.killSwitchTriggered)blocks.push("KILL_SWITCH");if(n(ctx.robustness,.5)<n(ctx.minRobustness,.5))blocks.push("LOW_ROBUSTNESS");if(n(ctx.executionQuality,.5)<n(ctx.minExecutionQuality,.4))blocks.push("POOR_EXECUTION");if(n(ctx.regimeConfidence,.5)<n(ctx.minRegimeConfidence,.45))blocks.push("LOW_REGIME_CONFIDENCE");if(n(ctx.dataConfidence,1)<n(ctx.minDataConfidence,.5))blocks.push("LOW_DATA_CONFIDENCE");return {pass:blocks.length===0,blocks}}
 function actionFromScore(net,confidence,threshold=.22){if(confidence<.55)return "WAIT";if(net>=threshold)return "BUY";if(net<=-threshold)return "SELL";return "WAIT"}
 function calibrate(raw,quality=.7){return clamp(.5+(n(raw,.5)-.5)*(0.65+0.35*clamp(n(quality),0,1)),0,1)}
 function fuse(ctx={}){const f=weightedFusion(ctx.evidence||[],ctx.weights||DEFAULT_WEIGHTS),c=conflictResolution(f,ctx),rg=riskGate(ctx);let confidence=calibrate(f.confidence,ctx.calibrationQuality);let action=actionFromScore(f.netScore,confidence,n(ctx.threshold,.22));if(!rg.pass||c.requiresCaution)action="WAIT";const decisionId="ORACLE-"+Date.now()+"-"+Math.random().toString(36).slice(2,8).toUpperCase();return {decisionId,action,confidence,netScore:f.netScore,bullScore:f.bullScore,bearScore:f.bearScore,riskGate:rg,conflict:c,evidence:f.items,explanation:buildExplanation(action,f,c,rg),timestamp:new Date().toISOString()}}
 function buildExplanation(action,f,c,rg){const top=[...(f.items||[])].sort((a,b)=>b.effectiveWeight-a.effectiveWeight).slice(0,4);const evidence=top.map(x=>x.name+"="+x.direction).join(", ");const gate=rg.pass?"risk gates passed":"risk gate blocked";return action+" because "+evidence+"; "+gate+"; conflict index="+c.conflictIndex.toFixed(2)}
 function newbie(result){return {decision:result.action,confidencePct:Math.round(result.confidence*100),icon:result.action==="BUY"?"🟢":result.action==="SELL"?"🔴":"🟡",headline:result.action==="BUY"?"BUY setup":result.action==="SELL"?"SELL setup":"WAIT — no clear edge",reason:result.explanation}}
 function expert(result){return result}
 function audit(result){return {decisionId:result.decisionId,timestamp:result.timestamp,action:result.action,confidence:result.confidence,netScore:result.netScore,riskGate:result.riskGate,conflict:result.conflict,evidence:(result.evidence||[]).map(x=>({name:x.name,direction:x.direction,score:x.score,confidence:x.confidence,quality:x.quality,freshness:x.freshness,effectiveWeight:x.effectiveWeight,reason:x.reason}))}}
 global.OracleFusionV500000={DEFAULT_WEIGHTS,normalizeEvidence,weightedFusion,conflictResolution,riskGate,actionFromScore,calibrate,fuse,newbie,expert,audit};
})(typeof globalThis!=="undefined"?globalThis:window);
