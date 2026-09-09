/*
 V110000 WALK-FORWARD VALIDATION + LEAKAGE GUARD + CHAMPION/CHALLENGER
 Honest out-of-sample model evaluation. No automatic order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function temporalSplit(rows=[],trainDays=60,testDays=10){
    const a=[...rows].sort((x,y)=>new Date(x.timestamp)-new Date(y.timestamp));
    const windows=[]; let i=0;
    while(i+trainDays+testDays<=a.length){
      windows.push({train:a.slice(i,i+trainDays),test:a.slice(i+trainDays,i+trainDays+testDays)});
      i+=testDays;
    }
    return windows;
  }

  function leakageGuard(feature={},targetTime){
    const ft=Date.parse(feature.timestamp||"");
    const tt=Date.parse(targetTime||"");
    const leaked=Number.isFinite(ft)&&Number.isFinite(tt)&&ft>=tt;
    return {leaked,reason:leaked?"feature_timestamp_not_before_target":"PASS"};
  }

  function classificationMetrics(rows=[]){
    const a=rows.filter(x=>Number.isFinite(Number(x.prediction))&&Number.isFinite(Number(x.actual)));
    if(!a.length)return {n:0,accuracy:0,precision:0,recall:0,brier:null};
    let correct=0,tp=0,fp=0,fn=0,brier=0;
    a.forEach(x=>{
      const p=clamp(n(x.probability,.5),0,1), pred=n(x.prediction)>=0?1:0, act=n(x.actual)>=0?1:0;
      correct+=pred===act?1:0; tp+=pred===1&&act===1?1:0; fp+=pred===1&&act===0?1:0; fn+=pred===0&&act===1?1:0;
      brier+=(p-act)**2;
    });
    return {n:a.length,accuracy:correct/a.length*100,
      precision:tp/(tp+fp||1)*100,recall:tp/(tp+fn||1)*100,brier:brier/a.length};
  }

  function calibrationBins(rows=[],bins=10){
    const out=Array.from({length:bins},(_,i)=>({bin:i,predicted:0,actual:0,n:0}));
    rows.forEach(x=>{
      const p=clamp(n(x.probability,.5),0,1), i=Math.min(bins-1,Math.floor(p*bins));
      out[i].predicted+=p; out[i].actual+=n(x.actual,0); out[i].n++;
    });
    return out.map(x=>({...x,predicted:x.n?x.predicted/x.n:0,actual:x.n?x.actual/x.n:0}));
  }

  function modelScore(model,results=[]){
    const m=classificationMetrics(results);
    const brierPenalty=m.brier==null?50:m.brier*100;
    return .45*m.accuracy+.25*m.precision+.20*m.recall+.10*(100-brierPenalty);
  }

  function championChallenger(models=[],history={}){
    const scored=models.map(m=>({...m,score:modelScore(m,history[m.id]||[])})).sort((a,b)=>b.score-a.score);
    return {ranking:scored,champion:scored[0]||null,challenger:scored[1]||null};
  }

  function evaluate(rows=[]){
    const windows=temporalSplit(rows);
    const reports=windows.map((w,i)=>({window:i,trainSize:w.train.length,testSize:w.test.length,
      leakage:w.test.some(r=>(r.features||[]).some(f=>leakageGuard(f,r.targetTimestamp).leaked))}));
    return {windows:reports,leakageFree:reports.every(x=>!x.leakage)};
  }

  global.ValidationLabV110000={temporalSplit,leakageGuard,classificationMetrics,
    calibrationBins,modelScore,championChallenger,evaluate};
})(typeof globalThis!=="undefined"?globalThis:window);
