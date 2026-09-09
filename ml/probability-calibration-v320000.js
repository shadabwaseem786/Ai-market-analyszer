/*
 V320000 PROBABILITY CALIBRATION + UNCERTAINTY ENGINE
 Calibrates model probabilities and estimates uncertainty.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function brier(prob, outcome){
    const p=clamp(n(prob,.5),0,1), y=outcome?1:0;
    return (p-y)*(p-y);
  }

  function bins(history=[], binCount=10){
    const out=Array.from({length:binCount},()=>({n:0,sumP:0,sumY:0,brier:0}));
    for(const h of history){
      const p=clamp(n(h.probability,.5),0,1);
      const y=h.outcome?1:0;
      const i=Math.min(binCount-1,Math.floor(p*binCount));
      out[i].n++; out[i].sumP+=p; out[i].sumY+=y; out[i].brier+=brier(p,y);
    }
    return out.map((b,i)=>({
      bin:i, count:b.n,
      meanProbability:b.n?b.sumP/b.n:null,
      empiricalRate:b.n?b.sumY/b.n:null,
      brier:b.n?b.brier/b.n:null
    }));
  }

  function isotonicLikeCalibrate(probability, history=[], binCount=10){
    const p=clamp(n(probability,.5),0,1);
    const bs=bins(history,binCount);
    const idx=Math.min(binCount-1,Math.floor(p*binCount));
    const b=bs[idx];
    if(!b || b.count<10)return {probability:p,calibrated:p,method:"IDENTITY_LOW_SAMPLE",sampleSize:b?.count||0};
    return {
      probability:p,
      calibrated:clamp(b.empiricalRate,0.01,0.99),
      method:"EMPIRICAL_BIN_CALIBRATION",
      sampleSize:b.count
    };
  }

  function wilson(successes,trials,z=1.96){
    const ntr=Math.max(0,Math.floor(n(trials,0)));
    if(!ntr)return {low:0,high:1};
    const ph=clamp(n(successes,0)/ntr,0,1);
    const zz=n(z,1.96), den=1+zz*zz/ntr;
    const center=(ph+zz*zz/(2*ntr))/den;
    const half=zz*Math.sqrt((ph*(1-ph)+zz*zz/(4*ntr))/ntr)/den;
    return {low:clamp(center-half,0,1),high:clamp(center+half,0,1)};
  }

  function uncertainty(calibratedProbability, history=[], regime=null){
    let rows=history;
    if(regime)rows=rows.filter(h=>h.regime===regime);
    const wins=rows.filter(h=>h.outcome).length;
    const interval=wilson(wins,rows.length);
    const width=interval.high-interval.low;
    const sampleConfidence=clamp(rows.length/100,0,1);
    const uncertaintyScore=clamp(width*100*(1-.4*sampleConfidence),0,100);
    return {
      probability:clamp(n(calibratedProbability,.5),0,1),
      interval,
      width,
      sampleSize:rows.length,
      uncertaintyScore,
      level:uncertaintyScore>=55?"HIGH":uncertaintyScore>=30?"MEDIUM":"LOW"
    };
  }

  function finalProbability(input={}){
    const raw=clamp(n(input.rawProbability,.5),0,1);
    const cal=isotonicLikeCalibrate(raw,input.history||[],n(input.binCount,10));
    const unc=uncertainty(cal.calibrated,input.history||[],input.regime||null);
    const regimeAdj=clamp(n(input.regimeAdjustment,0),-.20,.20);
    const final=clamp(cal.calibrated+regimeAdj,0.01,0.99);
    return {
      rawProbability:raw,
      calibratedProbability:cal.calibrated,
      finalProbability:final,
      calibrationMethod:cal.method,
      uncertainty:unc,
      reliabilityGate:
        (cal.sampleSize<10 || unc.level==="HIGH")?"CAUTION":"CALIBRATED"
    };
  }

  global.ProbabilityEngineV320000={brier,bins,isotonicLikeCalibrate,wilson,uncertainty,finalProbability};
})(typeof globalThis!=="undefined"?globalThis:window);
