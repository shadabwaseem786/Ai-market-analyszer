/*
 V580000 CATALYST IMPACT BACKTEST + COUNTERFACTUAL REPLAY
 Replays timestamped historical catalyst scenarios through the dependency graph.
 Compares predicted vs realized impact and supports calibration/learning.
 Research only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
  const sign=x=>x>0?1:x<0?-1:0;

  function replayCase(c={}){
    const predicted=n(c.predictedImpact,0);
    const realized=n(c.realizedImpact,0);
    const error=realized-predicted;
    return {
      id:c.id||String(c.timestamp||Date.now()),
      timestamp:c.timestamp||null,
      catalyst:c.catalyst||"UNKNOWN",
      predictedImpact:predicted,
      realizedImpact:realized,
      error,
      absError:Math.abs(error),
      directionCorrect:sign(predicted)===sign(realized) && sign(realized)!==0,
      regime:c.regime||"UNKNOWN",
      instrument:c.instrument||"UNKNOWN"
    };
  }

  function metrics(cases=[]){
    const rows=cases.map(replayCase);
    if(!rows.length) return {count:0,mae:0,rmse:0,directionalAccuracy:0,bias:0};
    const mae=rows.reduce((s,x)=>s+x.absError,0)/rows.length;
    const mse=rows.reduce((s,x)=>s+x.error*x.error,0)/rows.length;
    const acc=rows.filter(x=>x.directionCorrect).length/rows.length*100;
    const bias=rows.reduce((s,x)=>s+x.error,0)/rows.length;
    return {count:rows.length,mae,rmse:Math.sqrt(mse),
      directionalAccuracy:acc,bias,rows};
  }

  function regimeMetrics(cases=[]){
    const groups={};
    cases.forEach(c=>{
      const r=replayCase(c), k=r.regime;
      (groups[k]??=[]).push(r);
    });
    return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,metrics(v)]));
  }

  function catalystMetrics(cases=[]){
    const groups={};
    cases.forEach(c=>{
      const r=replayCase(c), k=r.catalyst;
      (groups[k]??=[]).push(r);
    });
    return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,metrics(v)]));
  }

  function counterfactual(input={}){
    const base=n(input.realizedBase,0);
    const catalyst=n(input.catalystEffect,0);
    const withoutCatalyst=base-catalyst;
    return {
      observed:base,
      estimatedWithoutCatalyst:withoutCatalyst,
      estimatedCatalystContribution:catalyst,
      sensitivity:clamp(Math.abs(catalyst)/(Math.abs(base)||1)*100,0,100)
    };
  }

  function walkForward(cases=[],trainSize=50,testSize=20){
    const rows=cases.map(replayCase).sort((a,b)=>String(a.timestamp).localeCompare(String(b.timestamp)));
    const folds=[];
    for(let i=trainSize;i<rows.length;i+=testSize){
      const train=rows.slice(0,i);
      const test=rows.slice(i,Math.min(i+testSize,rows.length));
      if(!test.length) break;
      folds.push({trainCount:train.length,testCount:test.length,
        train:metrics(train),test:metrics(test)});
    }
    return folds;
  }

  function learningGate(input={}){
    const m=metrics(input.cases||[]);
    const minSamples=n(input.minSamples,50);
    const holdout=metrics(input.holdout||[]);
    const improvement=n(input.improvement,0);
    const eligible=m.count>=minSamples && holdout.count>=Math.max(20,Math.floor(minSamples*.4));
    return {
      eligible,
      sufficientSamples:m.count>=minSamples,
      holdoutPassed:holdout.count>=Math.max(20,Math.floor(minSamples*.4)),
      improvement,
      approveUpdate:eligible && improvement>0 && holdout.directionalAccuracy>=m.directionalAccuracy
    };
  }

  global.CatalystBacktestV580000={
    replayCase,metrics,regimeMetrics,catalystMetrics,counterfactual,walkForward,learningGate
  };
})(typeof globalThis!=="undefined"?globalThis:window);
