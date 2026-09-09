/*
 V700000 UNIFIED TEMPORAL SIGNAL FUSION
 Batch upgrade: temporal sequence AI, adaptive weighting, confidence calibration,
 data-quality gating, multi-market profiles, conflict resolution and decision audit.
 Research/inference only. No automatic order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
  const sign=x=>x>0?1:x<0?-1:0;

  const MARKET_PROFILES={
    NSE:{currency:"INR",assetClass:"equity_derivatives",timezone:"Asia/Kolkata"},
    NASDAQ:{currency:"USD",assetClass:"equity",timezone:"America/New_York"},
    COMMODITY:{currency:"USD",assetClass:"commodity",timezone:"Asia/Kolkata"}
  };

  function sequenceScore(events=[]){
    const rows=[...events].sort((a,b)=>n(a.t)-n(b.t));
    if(rows.length<2) return {score:0,acceleration:0,coherence:0};
    let aligned=0,total=0,acc=0;
    for(let i=1;i<rows.length;i++){
      const prev=n(rows[i-1].signal), cur=n(rows[i].signal);
      aligned += sign(prev)===sign(cur)?1:0; total++;
      acc += Math.abs(cur)-Math.abs(prev);
    }
    return {score:clamp(aligned/total*100,0,100),
      acceleration:clamp(acc/Math.max(total,1),-100,100),
      coherence:clamp(aligned/total*100,0,100)};
  }

  function temporalDecay(ageMinutes,halfLife=60){
    return clamp(Math.pow(.5,Math.max(0,n(ageMinutes))/Math.max(halfLife,1)),0,1);
  }

  function qualityGate(features={}){
    const freshness=clamp(n(features.freshness,100),0,100);
    const completeness=clamp(n(features.completeness,100),0,100);
    const conflicts=clamp(n(features.conflicts,0),0,100);
    const stale=features.stale===true;
    const blocked=features.dataBlocked===true;
    const score=clamp(.45*freshness+.40*completeness+.15*(100-conflicts),0,100);
    return {score,pass:!blocked&&!stale&&score>=70};
  }

  function fuse(signals=[],options={}){
    const q=qualityGate(options.quality||{});
    const rows=signals.map(s=>{
      const weight=clamp(n(s.weight,1),0,1);
      const conf=clamp(n(s.confidence,50),0,100)/100;
      const decay=temporalDecay(n(s.ageMinutes,0),n(s.halfLife,60));
      return {...s,effectiveWeight:weight*conf*decay,
        signed:n(s.signal,0)*weight*conf*decay};
    });
    const denom=rows.reduce((a,b)=>a+b.effectiveWeight,0)||1;
    const score=rows.reduce((a,b)=>a+b.signed,0)/denom;
    const agreement=rows.length?rows.filter(x=>sign(x.signal)===sign(score)).length/rows.length*100:0;
    return {rows,score:clamp(score,-100,100),agreement,quality:q};
  }

  function adaptiveWeights(history=[]){
    const by={};
    history.forEach(h=>{
      const k=h.model||"unknown";
      if(!by[k]) by[k]={n:0,correct:0,error:0};
      by[k].n++; by[k].correct+=h.correct?1:0; by[k].error+=Math.abs(n(h.error,0));
    });
    return Object.fromEntries(Object.entries(by).map(([k,v])=>[
      k,{samples:v.n,accuracy:v.correct/v.n*100,mae:v.error/v.n,
        weight:clamp(.5+.5*(v.correct/v.n)-.01*(v.error/v.n),.1,1)}
    ]));
  }

  function calibrate(rawProbability,history=[]){
    const p=clamp(n(rawProbability,.5),.001,.999);
    if(!history.length) return {raw:p,calibrated:p};
    const avg=history.reduce((s,x)=>s+n(x.outcome,0),0)/history.length;
    const calibrated=clamp(p*.7+avg*.3,.001,.999);
    return {raw:p,calibrated};
  }

  function resolveDecision(input={}){
    const f=fuse(input.signals||[],input);
    const cal=calibrate(Math.abs(f.score)/100,input.outcomes||[]);
    const threshold=n(input.threshold,55);
    let decision=f.score>=threshold?"BUY":f.score<=-threshold?"SELL":"WAIT";
    if(!f.quality.pass) decision="NO-TRADE";
    if(f.agreement<40) decision="WAIT";
    return {...f,calibration:cal,decision};
  }

  function audit(input={}){
    const result=resolveDecision(input);
    return {timestamp:input.timestamp||null,market:input.market||"NSE",
      instrument:input.instrument||"UNKNOWN",result,
      modules:(input.signals||[]).map(s=>s.name||s.model||"signal"),
      guardrails:{qualityPass:result.quality.pass,
        agreementPass:result.agreement>=40,
        automaticExecution:false}};
  }

  global.UnifiedTemporalFusionV700000={
    MARKET_PROFILES,sequenceScore,temporalDecay,qualityGate,fuse,
    adaptiveWeights,calibrate,resolveDecision,audit
  };
})(typeof globalThis!=="undefined"?globalThis:window);
