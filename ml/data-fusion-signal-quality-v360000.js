/*
 V360000 DATA FUSION + REAL-TIME SIGNAL QUALITY ENGINE
 Scores freshness, reliability, completeness, conflict, latency, outliers and session validity.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function freshnessScore(ageSeconds, maxAgeSeconds){
    const age=Math.max(0,n(ageSeconds,0)), max=Math.max(1,n(maxAgeSeconds,300));
    return clamp(100*(1-age/max),0,100);
  }

  function completenessScore(source){
    const required=Array.isArray(source.requiredFields)?source.requiredFields:[];
    if(!required.length)return 100;
    const present=required.filter(k=>source.data && source.data[k]!==undefined && source.data[k]!==null).length;
    return 100*present/required.length;
  }

  function reliabilityScore(source){
    return clamp(n(source.reliability,70),0,100);
  }

  function latencyScore(latencyMs, targetMs){
    const l=Math.max(0,n(latencyMs,0)), t=Math.max(1,n(targetMs,1000));
    return clamp(100*Math.exp(-l/t),0,100);
  }

  function outlierScore(zScore, threshold=4){
    return clamp(100*(1-Math.max(0,Math.abs(n(zScore,0))-threshold)/Math.max(1,threshold*2)),0,100);
  }

  function sessionScore(inSession=true){
    return inSession?100:35;
  }

  function sourceQuality(source={}){
    const f=freshnessScore(source.ageSeconds,source.maxAgeSeconds);
    const c=completenessScore(source);
    const r=reliabilityScore(source);
    const l=latencyScore(source.latencyMs,source.targetLatencyMs);
    const o=outlierScore(source.zScore,source.outlierThreshold);
    const s=sessionScore(source.inSession!==false);
    const score=.25*f+.20*c+.20*r+.10*l+.15*o+.10*s;
    return {...source,qualityScore:score,components:{freshness:f,completeness:c,reliability:r,latency:l,outlier:o,session:s}};
  }

  function agreement(sources=[], field){
    const vals=sources.map(s=>Number(s.data?.[field])).filter(Number.isFinite);
    if(vals.length<2)return {agreement:100,spread:0,count:vals.length};
    const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
    const variance=vals.reduce((a,b)=>a+(b-mean)**2,0)/vals.length;
    const spread=Math.sqrt(variance);
    const scale=Math.max(.000001,Math.abs(mean));
    return {agreement:clamp(100*(1-spread/(scale*2+1)),0,100),spread,count:vals.length};
  }

  function fusedValue(sources=[], field){
    const usable=sources.map(sourceQuality).filter(s=>s.qualityScore>=45 && Number.isFinite(Number(s.data?.[field])));
    if(!usable.length)return {value:null,quality:0,sourcesUsed:0,conflict:100};
    let num=0,den=0;
    for(const s of usable){const w=Math.max(.01,s.qualityScore);num+=Number(s.data[field])*w;den+=w;}
    const value=num/den;
    const ag=agreement(usable,field);
    return {value,quality:den/(usable.length*100),sourcesUsed:usable.length,agreement:ag.agreement,spread:ag.spread,conflict:100-ag.agreement};
  }

  function signalGate(sources=[], fields=[]){
    const scored=sources.map(sourceQuality);
    const avg=scored.length?scored.reduce((a,b)=>a+b.qualityScore,0)/scored.length:0;
    const fusions=fields.map(field=>({field,...fusedValue(sources,field)}));
    const conflict=fusions.length?Math.max(...fusions.map(x=>n(x.conflict,100))):100;
    const gate=(avg<55||conflict>=60||!scored.length)?"BLOCK":
      (avg<70||conflict>=35)?"CAUTION":"PASS";
    return {gate,averageQuality:avg,maxConflict:conflict,sources:scored,fusions};
  }

  function integrityReport(sources=[],fields=[]){
    const gate=signalGate(sources,fields);
    return {
      ...gate,
      usableForHighConfidence:gate.gate==="PASS",
      rule:"High-confidence decisions require fresh, complete, reliable and sufficiently agreeing data."
    };
  }

  global.DataFusionV360000={freshnessScore,completenessScore,reliabilityScore,latencyScore,outlierScore,sessionScore,sourceQuality,agreement,fusedValue,signalGate,integrityReport};
})(typeof globalThis!=="undefined"?globalThis:window);
