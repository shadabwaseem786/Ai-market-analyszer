/*
 V520000 REAL-TIME MARKET MEMORY + SELF-LEARNING LOOP
 Stores prediction context/outcomes, measures error, detects persistent drift,
 and proposes validated weight/threshold changes. It never applies changes
 without validation. Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function makeRecord(input={}){
    return {
      id:input.id||("pred_"+Date.now()),
      timestamp:input.timestamp||new Date().toISOString(),
      instrument:input.instrument||"UNKNOWN",
      horizon:input.horizon||"UNKNOWN",
      regime:input.regime||"UNKNOWN",
      direction:String(input.direction||"WAIT").toUpperCase(),
      probability:clamp(n(input.probability,.5),0,1),
      confidence:clamp(n(input.confidence,50),0,100),
      features:input.features||{},
      modelWeights:input.modelWeights||{},
      catalystState:input.catalystState||{},
      fnoState:input.fnoState||{},
      outcome:null,
      resolvedAt:null
    };
  }

  function resolve(record={},outcome={}){
    const actual=clamp(n(outcome.actualProbability,
      outcome.direction==="BUY"?1:outcome.direction==="SELL"?0:.5),0,1);
    const pred=clamp(n(record.probability,.5),0,1);
    return {...record,outcome:{...outcome,actualProbability:actual,
      correct:Math.abs(pred-actual)<=n(outcome.tolerance,.5)},
      resolvedAt:outcome.resolvedAt||new Date().toISOString(),
      brierError:Math.pow(pred-actual,2),
      signedError:actual-pred
    };
  }

  function summarize(records=[]){
    const r=records.filter(x=>x && x.outcome);
    if(!r.length)return {samples:0,status:"NO_HISTORY"};
    const brier=r.reduce((s,x)=>s+n(x.brierError,0),0)/r.length;
    const accuracy=r.filter(x=>x.outcome.correct).length/r.length;
    const meanError=r.reduce((s,x)=>s+n(x.signedError,0),0)/r.length;
    const byRegime={};
    r.forEach(x=>{
      const k=x.regime||"UNKNOWN";
      (byRegime[k]??=[]).push(x);
    });
    const regimeSummary=Object.fromEntries(Object.entries(byRegime).map(([k,v])=>[
      k,{samples:v.length,accuracy:v.filter(x=>x.outcome.correct).length/v.length,
        brier:v.reduce((s,x)=>s+n(x.brierError,0),0)/v.length}
    ]));
    return {samples:r.length,accuracy,brier,meanError,regimeSummary,
      status:r.length>=50?"LEARNABLE":"COLLECTING"};
  }

  function detectDrift(records=[],window=30){
    const r=records.filter(x=>x&&x.outcome);
    if(r.length<window*2)return {drift:false,reason:"INSUFFICIENT_HISTORY"};
    const a=r.slice(-window), b=r.slice(-window*2,-window);
    const mean=xs=>xs.reduce((s,x)=>s+n(x.signedError,0),0)/xs.length;
    const delta=Math.abs(mean(a)-mean(b));
    return {drift:delta>=.10,delta,threshold:.10,
      recentMeanError:mean(a),priorMeanError:mean(b)};
  }

  function proposeAdjustment(history=[],candidate={}){
    const s=summarize(history), d=detectDrift(history);
    if(s.samples<50 || d.drift===false)
      return {approved:false,status:"HOLD",reason:s.samples<50?"INSUFFICIENT_SAMPLES":"NO_SIGNIFICANT_DRIFT"};
    const maxStep=n(candidate.maxStep,.05);
    const direction=s.meanError>0?1:-1;
    const adjustment=clamp(direction*maxStep,-maxStep,maxStep);
    return {approved:false,status:"REQUIRES_VALIDATION",reason:"DRIFT_DETECTED",
      suggestedProbabilityOffset:adjustment,summary:s,drift:d};
  }

  function validateCandidate(baseline={},candidate={},holdout=[]){
    const baseErr=n(baseline.brier,1), candErr=n(candidate.brier,1);
    const improvement=baseErr-candErr;
    const minImprovement=n(candidate.minImprovement,.01);
    return {validated:holdout.length>=30 && improvement>=minImprovement,
      holdoutSamples:holdout.length,baselineBrier:baseErr,
      candidateBrier:candErr,improvement,minImprovement};
  }

  global.MarketMemoryV520000={makeRecord,resolve,summarize,detectDrift,
    proposeAdjustment,validateCandidate};
})(typeof globalThis!=="undefined"?globalThis:window);
