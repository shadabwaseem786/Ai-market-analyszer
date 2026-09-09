/*
 V260000 PREDICTIVE EXECUTION QUALITY + SLIPPAGE + TRADEABILITY
 Decision support only. No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

 function spreadCost(bid,ask,mid){
   const m=n(mid)||((n(bid)+n(ask))/2);
   return m>0?Math.max(0,n(ask)-n(bid))/m*100:0;
 }
 function slippageEstimate(x={}){
   const notional=Math.max(0,n(x.orderNotional));
   const depth=Math.max(1,n(x.availableDepth));
   const vol=Math.max(0,n(x.volatilityPct));
   const spread=spreadCost(x.bid,x.ask,x.mid);
   const impact=clamp((notional/depth)*35,0,10);
   const volCost=clamp(vol*.08,0,10);
   return {spreadPct:spread,impactPct:impact,volatilityCostPct:volCost,
     estimatedPct:clamp(spread/2+impact+volCost,0,20)};
 }
 function tradeability(x={}){
   const slip=slippageEstimate(x);
   const rr=Math.max(0,n(x.rewardRisk));
   const edge=Math.max(0,n(x.expectedEdgePct));
   const confidence=clamp(n(x.confidence,50),0,100);
   const liquidity=clamp(n(x.liquidityScore,50),0,100);
   const score=clamp(.25*confidence+.25*liquidity+.25*Math.min(100,rr*25)+.25*Math.min(100,edge*20)-slip.estimatedPct*5,0,100);
   const state=score>=70?"TRADEABLE":score>=50?"MARGINAL":"NOT_TRADEABLE";
   return {score,state,slippage:slip};
 }
 function entryQuality(x={}){
   const distance=Math.abs(n(x.entryDistancePct));
   const spread=n(x.spreadPct);
   const urgency=clamp(n(x.urgency,50),0,100);
   const score=clamp(100-distance*12-spread*25-urgency*.15,0,100);
   return {score,label:score>=75?"GOOD":score>=50?"FAIR":"POOR"};
 }
 function riskReward(x={}){
   const reward=Math.max(0,n(x.targetPct));
   const risk=Math.max(.01,n(x.stopPct));
   return {rewardPct:reward,riskPct:risk,ratio:reward/risk};
 }
 function executionGate(x={}){
   const t=tradeability(x), e=entryQuality(x), rr=riskReward(x);
   const veto=t.state==="NOT_TRADEABLE"||e.label==="POOR"||rr.ratio<1.2;
   return {tradeability:t,entry:e,riskReward:rr,veto,
     decision:veto?"NO-TRADE":"EXECUTION-QUALITY-PASS"};
 }
 global.ExecutionQualityV260000={spreadCost,slippageEstimate,tradeability,entryQuality,riskReward,executionGate};
})(typeof globalThis!=="undefined"?globalThis:window);
