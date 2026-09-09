/*
 V470000 AI MODEL CHAMPIONSHIP + AUTO-ENSEMBLE
 Selects specialist model weights by context and reliability.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function normalize(m={}){
    return {
      id:m.id||m.name||"model",
      name:m.name||m.id||"model",
      family:m.family||"generic",
      prediction:clamp(n(m.prediction,.5),0,1),
      reliability:clamp(n(m.reliability,50),0,100),
      calibration:clamp(n(m.calibration,50),0,100),
      regimeFit:clamp(n(m.regimeFit,50),0,100),
      recentPerformance:clamp(n(m.recentPerformance,50),0,100),
      driftHealth:clamp(n(m.driftHealth,70),0,100),
      dataCoverage:clamp(n(m.dataCoverage,70),0,100),
      complexityPenalty:clamp(n(m.complexityPenalty,0),0,100),
      enabled:m.enabled!==false
    };
  }

  function score(m){
    const x=normalize(m);
    const s=.22*x.reliability+.20*x.calibration+.18*x.regimeFit+
      .18*x.recentPerformance+.10*x.driftHealth+.08*x.dataCoverage-
      .04*x.complexityPenalty;
    return {...x,championshipScore:clamp(s,0,100)};
  }

  function rank(models=[]){
    return models.map(score).filter(x=>x.enabled)
      .sort((a,b)=>b.championshipScore-a.championshipScore)
      .map((x,i)=>({...x,rank:i+1}));
  }

  function ensemble(models=[],opts={}){
    const ranked=rank(models);
    const top=ranked.slice(0,n(opts.maxModels,8));
    const minScore=n(opts.minScore,55);
    const eligible=top.filter(x=>x.championshipScore>=minScore);
    const raw=eligible.map(x=>Math.pow(Math.max(.01,x.championshipScore/100),n(opts.power,2)));
    const total=raw.reduce((a,b)=>a+b,0)||1;
    const weights=eligible.map((x,i)=>({...x,weight:raw[i]/total}));
    const prediction=weights.reduce((s,x)=>s+x.prediction*x.weight,0);
    const agreement=weights.length?
      100*(1-(weights.reduce((s,x)=>s+x.weight*Math.abs(x.prediction-prediction),0))):0;
    return {models:weights,prediction,agreement,champion:weights[0]?.name||null};
  }

  function challengerTest(champion,challengers=[],actuals=[]){
    const all=[champion,...challengers].map(score);
    return rank(all).map(x=>({...x,
      outOfSampleSamples:actuals.length,
      status:x.recentPerformance>=(n(champion?.recentPerformance,0)+3)?"CHALLENGE":"HOLD"
    }));
  }

  global.ModelChampionshipV470000={normalize,score,rank,ensemble,challengerTest};
})(typeof globalThis!=="undefined"?globalThis:window);
