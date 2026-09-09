/*
 V380000 ONLINE LEARNING + MODEL CHAMPIONSHIP ENGINE
 Walk-forward model scoring, regime-specific ranking, decay and challenger promotion.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function brier(prob,outcome){
    const p=clamp(n(prob,.5),0,1), y=outcome?1:0;
    return (p-y)*(p-y);
  }

  function scoreHistory(rows=[]){
    if(!rows.length)return {samples:0,winRate:.5,brier:.25,score:50};
    const wins=rows.filter(r=>r.outcome).length;
    const br=rows.reduce((a,r)=>a+brier(r.probability,r.outcome),0)/rows.length;
    const win=wins/rows.length;
    const score=clamp(100*(.55*win+.45*(1-br)),0,100);
    return {samples:rows.length,winRate:win,brier:br,score};
  }

  function regimeScore(model, history=[], regime){
    const rows=history.filter(r=>(!regime || r.regime===regime) &&
                                  (!model.id || r.modelId===model.id));
    const s=scoreHistory(rows);
    return {...model,...s,regime:regime||"ALL"};
  }

  function rank(models=[], history=[], regime){
    return models.map(m=>regimeScore(m,history,regime))
      .sort((a,b)=>(b.score*n(Math.log10(b.samples+10),1))-
                    (a.score*n(Math.log10(a.samples+10),1)));
  }

  function decay(baseScore, ageSamples, halfLife=30){
    return clamp(n(baseScore,50)*Math.pow(.5,Math.max(0,n(ageSamples,0)/Math.max(1,n(halfLife,30)))),0,100);
  }

  function championship(models=[], history=[], regime, opts={}){
    const ranked=rank(models,history,regime).map(m=>({
      ...m,
      decayedScore:decay(m.score,m.ageSamples,opts.halfLife||30)
    })).sort((a,b)=>b.decayedScore-a.decayedScore);
    const champion=ranked[0]||null;
    const challenger=ranked[1]||null;
    const margin=champion&&challenger?champion.decayedScore-challenger.decayedScore:0;
    return {
      regime,
      leaderboard:ranked,
      champion,
      challenger,
      margin,
      promotionReady:!!champion && champion.samples>=n(opts.minSamples,30) && margin>=n(opts.minMargin,5)
    };
  }

  function ensembleWeights(championshipResult){
    const rows=championshipResult?.leaderboard||[];
    const top=rows.slice(0,Math.min(8,rows.length));
    const raw=top.map(m=>Math.max(.01,m.decayedScore));
    const sum=raw.reduce((a,b)=>a+b,0)||1;
    return top.map((m,i)=>({...m,ensembleWeight:raw[i]/sum}));
  }

  function onlineUpdate(modelState={}, newObservation={}){
    const alpha=clamp(n(modelState.learningRate,.05),.001,.5);
    const old=n(modelState.qualityScore,50);
    const outcome=newObservation.outcome?100:0;
    const updated=old*(1-alpha)+outcome*alpha;
    return {...modelState,qualityScore:updated,observations:n(modelState.observations,0)+1,lastUpdate:newObservation.timestamp||null};
  }

  global.ModelChampionshipV380000={brier,scoreHistory,regimeScore,rank,decay,championship,ensembleWeights,onlineUpdate};
})(typeof globalThis!=="undefined"?globalThis:window);
