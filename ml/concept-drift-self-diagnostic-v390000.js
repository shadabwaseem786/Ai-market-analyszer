/*
 V390000 CONCEPT DRIFT + AI SELF-DIAGNOSTIC ENGINE
 Detects distribution drift, performance deterioration, relationship breakdown,
 feature anomalies and model disagreement. Research/inference only.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function mean(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0;}
  function variance(a){
    if(a.length<2)return 0;
    const m=mean(a); return mean(a.map(x=>(x-m)**2));
  }

  function psi(expected=[],actual=[],bins=10){
    if(!expected.length||!actual.length)return null;
    const all=expected.concat(actual);
    const lo=Math.min(...all), hi=Math.max(...all);
    if(lo===hi)return 0;
    const width=(hi-lo)/bins;
    const hist=(arr)=>{
      const h=Array(bins).fill(0);
      for(const x of arr){
        const i=Math.min(bins-1,Math.max(0,Math.floor((x-lo)/width)));
        h[i]++;
      }
      return h.map(v=>Math.max(v/arr.length,1e-6));
    };
    const e=hist(expected), a=hist(actual);
    return e.reduce((s,p,i)=>s+(a[i]-p)*Math.log(a[i]/p),0);
  }

  function ksLike(expected=[],actual=[]){
    if(!expected.length||!actual.length)return null;
    const a=expected.slice().sort((x,y)=>x-y), b=actual.slice().sort((x,y)=>x-y);
    const vals=[...new Set(a.concat(b))];
    let d=0;
    for(const v of vals){
      let ca=0,cb=0;
      for(const x of a)if(x<=v)ca++;
      for(const x of b)if(x<=v)cb++;
      d=Math.max(d,Math.abs(ca/a.length-cb/b.length));
    }
    return d;
  }

  function performanceDrift(history=[],recentN=30,baselineN=120){
    const usable=history.filter(x=>Number.isFinite(Number(x.score)));
    const recent=usable.slice(-recentN).map(x=>Number(x.score));
    const base=usable.slice(-(recentN+baselineN),-recentN).map(x=>Number(x.score));
    if(!recent.length||!base.length)return {available:false};
    const r=mean(recent), b=mean(base);
    const delta=r-b;
    return {available:true,recentMean:r,baselineMean:b,delta,relativeDelta:b?delta/Math.abs(b):0};
  }

  function featureDrift(reference={},current={},thresholds={}){
    const out=[];
    const keys=[...new Set(Object.keys(reference).concat(Object.keys(current)))];
    for(const k of keys){
      const a=Array.isArray(reference[k])?reference[k]:[];
      const b=Array.isArray(current[k])?current[k]:[];
      const p=psi(a,b);
      const ks=ksLike(a,b);
      const psiLimit=n(thresholds.psi,.20), ksLimit=n(thresholds.ks,.20);
      out.push({feature:k,psi:p,ks,drift:(p!==null&&p>psiLimit)||(ks!==null&&ks>ksLimit)});
    }
    return out;
  }

  function correlationBreakdown(referencePairs=[],currentPairs=[],threshold=.25){
    return referencePairs.map((r,i)=>{
      const c=currentPairs[i];
      if(!c)return {...r,missing:true,broken:true};
      const delta=Math.abs(n(r.correlation,0)-n(c.correlation,0));
      return {...r,currentCorrelation:n(c.correlation,0),delta,broken:delta>=threshold};
    });
  }

  function modelDisagreement(predictions=[]){
    const p=predictions.map(n).filter(Number.isFinite);
    if(p.length<2)return {spread:0,disagreement:0};
    const m=mean(p), sd=Math.sqrt(variance(p));
    return {mean:m,spread:sd,disagreement:clamp(sd*200,0,100)};
  }

  function selfDiagnostic(input={}){
    const perf=performanceDrift(input.performanceHistory||[],input.recentN,input.baselineN);
    const features=featureDrift(input.referenceFeatures||{},input.currentFeatures||{},input.driftThresholds||{});
    const broken=(input.correlationReference&&input.correlationCurrent)?
      correlationBreakdown(input.correlationReference,input.correlationCurrent,input.correlationThreshold):[];
    const disagreement=modelDisagreement(input.predictions||[]);
    const featureCount=features.filter(x=>x.drift).length;
    const brokenCount=broken.filter(x=>x.broken).length;
    const perfPenalty=perf.available&&perf.relativeDelta<0?clamp(-perf.relativeDelta*100,0,40):0;
    const driftPenalty=clamp(featureCount*8+brokenCount*10+disagreement.disagreement*.25,0,60);
    const health=clamp(100-perfPenalty-driftPenalty,0,100);
    const state=health>=75?"HEALTHY":health>=55?"DEGRADED":"UNSTABLE";
    const action=state==="HEALTHY"?"NORMAL":state==="DEGRADED"?"REDUCE_CONFIDENCE":"QUARANTINE";
    return {state,health,action,performance:perf,featureDrift:features,correlationBreakdown:broken,modelDisagreement:disagreement};
  }

  global.SelfDiagnosticV390000={psi,ksLike,performanceDrift,featureDrift,correlationBreakdown,modelDisagreement,selfDiagnostic};
})(typeof globalThis!=="undefined"?globalThis:window);
