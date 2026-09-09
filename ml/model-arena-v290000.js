/*
 V290000 SELF-VALIDATING MODEL ARENA
 Outcome tracking + calibration + adaptive model weighting + regime specialization.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function brier(probability, outcome){
    const p=clamp(n(probability,.5),0,1), y=outcome?1:0;
    return Math.pow(p-y,2);
  }

  function logLoss(probability, outcome){
    const p=clamp(n(probability,.5),.000001,.999999), y=outcome?1:0;
    return -(y*Math.log(p)+(1-y)*Math.log(1-p));
  }

  function updateModel(model, result){
    const prior=n(model.weight,1);
    const lr=clamp(n(model.learningRate,.08),.01,.5);
    const correct=String(result.prediction).toUpperCase()===String(result.actual).toUpperCase();
    const b=brier(n(result.probability,.5),result.actual===result.prediction);
    const reward=correct?1:(-1);
    const quality=clamp(1-b,0,1);
    const next=clamp(prior*(1+lr*reward*.35+lr*(quality-.5)),.05,5);
    return {...model,weight:next,correct,quality,brier:b,logLoss:logLoss(n(result.probability,.5),result.actual===result.prediction)};
  }

  function evaluateHistory(model, history=[]){
    const rows=history.filter(x=>x && x.model===model.id);
    if(!rows.length)return {...model,sampleSize:0,accuracy:null,avgBrier:null,avgLogLoss:null,calibration:null};
    let correct=0,b=0,ll=0;
    for(const r of rows){
      if(String(r.prediction).toUpperCase()===String(r.actual).toUpperCase())correct++;
      b+=brier(r.probability,r.actual===r.prediction);
      ll+=logLoss(r.probability,r.actual===r.prediction);
    }
    const acc=correct/rows.length;
    const avgB=b/rows.length;
    const calibration=clamp(100*(1-avgB),0,100);
    return {...model,sampleSize:rows.length,accuracy:acc*100,avgBrier:avgB,avgLogLoss:ll/rows.length,calibration};
  }

  function arena(models=[], history=[], regime="UNKNOWN"){
    const evaluated=models.map(m=>evaluateHistory(m,history));
    const regimeRows=evaluated.map(m=>{
      const r=m.regimes?.[regime];
      return r?{...m,regimeCalibration:n(r.calibration,m.calibration||50),regimeWeight:n(r.weight,m.weight||1)}:m;
    });
    return regimeRows.sort((a,b)=>
      (n(b.regimeCalibration,b.calibration||50)*n(b.regimeWeight,b.weight||1))-
      (n(a.regimeCalibration,a.calibration||50)*n(a.regimeWeight,a.weight||1))
    );
  }

  function selectWeights(models=[], regime="UNKNOWN"){
    const ranked=arena(models,[],regime);
    const sum=ranked.reduce((s,m)=>s+Math.max(.01,n(m.regimeWeight,m.weight||1)),0)||1;
    return ranked.map(m=>({...m,normalizedWeight:Math.max(.01,n(m.regimeWeight,m.weight||1))/sum}));
  }

  function promoteOrRetire(model, minSamples=30){
    if(n(model.sampleSize,0)<minSamples)return {...model,status:"LEARNING"};
    const cal=n(model.calibration,50), acc=n(model.accuracy,50);
    if(cal>=72 && acc>=58)return {...model,status:"PROMOTE"};
    if(cal<48 || acc<45)return {...model,status:"DOWNWEIGHT"};
    return {...model,status:"ACTIVE"};
  }

  global.ModelArenaV290000={brier,logLoss,updateModel,evaluateHistory,arena,selectWeights,promoteOrRetire};
})(typeof globalThis!=="undefined"?globalThis:window);
