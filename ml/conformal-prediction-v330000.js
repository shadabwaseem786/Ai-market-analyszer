/*
 V330000 CONFORMAL PREDICTION + DISTRIBUTION-FREE CONFIDENCE ENGINE
 Uses calibration residuals / nonconformity scores to build empirical prediction intervals.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function quantile(values,q){
    const a=values.filter(Number.isFinite).slice().sort((x,y)=>x-y);
    if(!a.length)return null;
    const qq=clamp(q,0,1), pos=(a.length-1)*qq;
    const lo=Math.floor(pos), hi=Math.ceil(pos);
    if(lo===hi)return a[lo];
    return a[lo]+(a[hi]-a[lo])*(pos-lo);
  }

  function nonconformity(predicted, actual){
    return Math.abs(n(predicted)-n(actual));
  }

  function calibrationScores(history=[]){
    return history
      .map(h=>nonconformity(h.predicted,h.actual))
      .filter(Number.isFinite);
  }

  function conformalInterval(predicted, history=[], coverage=.9){
    const scores=calibrationScores(history);
    if(scores.length<20){
      return {
        predicted:n(predicted,0),low:null,high:null,
        coverage:coverage,sampleSize:scores.length,
        status:"INSUFFICIENT_SAMPLE"
      };
    }
    const q=quantile(scores,clamp(coverage,0.5,.999));
    return {
      predicted:n(predicted,0),
      low:n(predicted,0)-q,
      high:n(predicted,0)+q,
      radius:q,
      coverage:coverage,
      sampleSize:scores.length,
      status:"CALIBRATED"
    };
  }

  function regimeInterval(predicted, history=[], regime, coverage=.9){
    const rows=regime?history.filter(h=>h.regime===regime):history;
    return conformalInterval(predicted,rows,coverage);
  }

  function directionSet(probability, threshold=.5, uncertainty=0){
    const p=clamp(n(probability,.5),0,1);
    const u=clamp(n(uncertainty,0),0,1);
    const lo=p-u, hi=p+u;
    const set=[];
    if(hi>=threshold)set.push("BUY");
    if(lo<=(1-threshold))set.push("SELL");
    if(!set.length)set.push("WAIT");
    return {set,lower:clamp(lo,0,1),upper:clamp(hi,0,1)};
  }

  function signalValidity(horizonMinutes, decayMinutes, dataFreshnessMinutes){
    const h=Math.max(1,n(horizonMinutes,60));
    const d=Math.max(1,n(decayMinutes,60));
    const f=Math.max(0,n(dataFreshnessMinutes,0));
    return clamp(100*Math.exp(-f/d)*Math.min(1,h/d),0,100);
  }

  function conformalDecision(input={}){
    const interval=regimeInterval(
      input.predictedMove,
      input.history||[],
      input.regime,
      n(input.coverage,.9)
    );
    const p=clamp(n(input.calibratedProbability,.5),0,1);
    const radius=interval.radius==null?0.2:n(input.probabilityRadius,0.2);
    const ds=directionSet(p,n(input.threshold,.6),radius);
    const validity=signalValidity(input.horizonMinutes,input.decayMinutes,input.dataFreshnessMinutes);
    let action="WAIT";
    if(interval.status==="INSUFFICIENT_SAMPLE" || validity<45) action="NO-TRADE";
    else if(ds.set.length!==1) action="WAIT";
    else action=ds.set[0];
    return {...interval,directionSet:ds,signalValidity:validity,action};
  }

  global.ConformalV330000={quantile,nonconformity,calibrationScores,conformalInterval,regimeInterval,directionSet,signalValidity,conformalDecision};
})(typeof globalThis!=="undefined"?globalThis:window);
