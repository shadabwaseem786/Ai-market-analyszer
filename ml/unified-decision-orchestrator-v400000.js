/*
 V400000 UNIFIED MARKET INTELLIGENCE + DECISION ORCHESTRATOR
 Evidence-aware conflict resolution across the complete AI stack.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  const DEFAULT_PRIORITY={
    dataQuality:1.30, selfDiagnostic:1.25, risk:1.35,
    regime:1.15, fno:1.15, fractal:1.10, causal:1.05,
    calibration:1.20, conformal:1.20, redTeam:1.25,
    monteCarlo:1.15, championship:1.10, memory:1.00
  };

  function normalizeEvidence(e={}){
    const action=String(e.action||"WAIT").toUpperCase();
    return {
      source:e.source||"unknown",
      action:["BUY","SELL","WAIT","NO-TRADE"].includes(action)?action:"WAIT",
      confidence:clamp(n(e.confidence,50),0,100),
      reliability:clamp(n(e.reliability,70),0,100),
      priority:n(e.priority,1),
      freshness:clamp(n(e.freshness,100),0,100),
      regimeFit:clamp(n(e.regimeFit,70),0,100),
      blocking:!!e.blocking,
      reason:e.reason||""
    };
  }

  function scoreEvidence(e, priorityMap={}){
    const x=normalizeEvidence(e);
    const p=n(priorityMap[x.source],x.priority);
    const trust=(x.reliability/100)*(x.freshness/100)*(x.regimeFit/100);
    const weight=Math.max(.01,p*trust);
    return {...x,weight,weightedConfidence:x.confidence*weight};
  }

  function aggregate(evidence=[]){
    const rows=evidence.map(e=>scoreEvidence(e,DEFAULT_PRIORITY));
    const votes={BUY:0,SELL:0,WAIT:0,"NO-TRADE":0};
    for(const r of rows)votes[r.action]+=r.weight;
    const total=Object.values(votes).reduce((a,b)=>a+b,0)||1;
    const shares={};
    for(const k of Object.keys(votes))shares[k]=votes[k]/total;
    const ranked=Object.entries(shares).sort((a,b)=>b[1]-a[1]);
    return {rows,votes,shares,ranked,dominant:ranked[0]?.[0]||"WAIT",dominance:(ranked[0]?.[1]||0)*100};
  }

  function resolve(input={}){
    const evidence=(input.evidence||[]).map(e=>scoreEvidence(e,input.priorityMap||DEFAULT_PRIORITY));
    const blockers=evidence.filter(e=>e.blocking);
    const agg=aggregate(input.evidence||[]);
    const top=agg.ranked[0]||["WAIT",0], second=agg.ranked[1]||["WAIT",0];
    const conflict=clamp((second[1]/Math.max(.0001,top[1]))*100,0,100);
    let action=agg.dominant;
    let confidence=clamp(agg.dominance*.65+(100-conflict)*.35,0,100);

    const dq=evidence.find(e=>e.source==="dataQuality");
    const health=evidence.find(e=>e.source==="selfDiagnostic");
    const risk=evidence.find(e=>e.source==="risk");
    if(blockers.length) action="NO-TRADE";
    if(dq && dq.confidence<55) action="NO-TRADE";
    if(health && health.confidence<45) action="WAIT";
    if(risk && risk.action==="NO-TRADE") action="NO-TRADE";
    if(conflict>=65 && action!=="NO-TRADE") action="WAIT";
    if(confidence<55 && action!=="NO-TRADE") action="WAIT";

    return {
      action,
      confidence,
      conflictScore:conflict,
      dominance:agg.dominance,
      shares:agg.shares,
      evidence,
      blockers:blockers.map(x=>({source:x.source,reason:x.reason})),
      explanation:buildExplanation(action,agg,evidence)
    };
  }

  function buildExplanation(action,agg,evidence){
    const supporters=evidence.filter(e=>e.action===action).sort((a,b)=>b.weight-a.weight).slice(0,3);
    const opponents=evidence.filter(e=>e.action!==action&&e.action!=="WAIT").sort((a,b)=>b.weight-a.weight).slice(0,3);
    return {
      action,
      supporters:supporters.map(x=>x.source),
      opposingSignals:opponents.map(x=>x.source),
      principle:"Evidence is weighted by reliability, freshness, regime fit and source priority; safety gates can override directional consensus."
    };
  }

  global.UnifiedOrchestratorV400000={normalizeEvidence,scoreEvidence,aggregate,resolve,buildExplanation,DEFAULT_PRIORITY};
})(typeof globalThis!=="undefined"?globalThis:window);
