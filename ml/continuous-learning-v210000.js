/*
 V210000 CONTINUOUS LEARNING LAB
 Adaptive research layer: outcome ledger, drift detection, calibration,
 champion/challenger ranking and regime/model scorecards.
 No order execution. No fabricated data.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function outcome(predicted, actual){
    const p=String(predicted||"").toUpperCase(), a=String(actual||"").toUpperCase();
    if(!p||!a)return {correct:null,confusion:"UNKNOWN"};
    if(p==="BUY")return {correct:a==="UP",confusion:a==="UP"?"TP":"FP"};
    if(p==="SELL")return {correct:a==="DOWN",confusion:a==="DOWN"?"TP":"FP"};
    return {correct:a==="TIME"||a==="FLAT",confusion:"ABSTAIN"};
  }

  function scorecard(ledger, filter={}){
    const rows=(ledger||[]).filter(x =>
      (!filter.model||x.model===filter.model) &&
      (!filter.regime||x.regime===filter.regime) &&
      (!filter.symbol||x.symbol===filter.symbol)
    );
    const labeled=rows.filter(x=>x.actual);
    const scored=labeled.map(x=>({...x,...outcome(x.action||x.prediction,x.actual)}));
    const actionable=scored.filter(x=>x.confusion!=="ABSTAIN");
    const correct=actionable.filter(x=>x.correct).length;
    const hitRate=actionable.length?correct/actionable.length*100:null;
    const abstain=rows.length?scored.filter(x=>x.confusion==="ABSTAIN").length/rows.length*100:0;
    const avgProb=scored.length?scored.reduce((s,x)=>s+n(x.calibratedProbability,50),0)/scored.length:50;
    return {samples:rows.length,labeled:labeled.length,actionable:actionable.length,hitRate,abstainRate:abstain,avgProbability:avgProb};
  }

  function drift(history, windowSize=50){
    const rows=(history||[]).filter(x=>typeof x.error==="number");
    if(rows.length<windowSize*2)return {status:"INSUFFICIENT",shift:0};
    const a=rows.slice(-windowSize), b=rows.slice(-windowSize*2,-windowSize);
    const ma=a.reduce((s,x)=>s+x.error,0)/windowSize;
    const mb=b.reduce((s,x)=>s+x.error,0)/windowSize;
    const shift=Math.abs(ma-mb);
    return {status:shift>0.15?"DRIFT":"STABLE",shift, recentError:ma,previousError:mb};
  }

  function rankChampions(models, ledgers, regime){
    return (models||[]).map(m=>{
      const sc=scorecard(ledgers||[],{model:m.name,regime});
      const samples=sc.actionable;
      const reliability=samples>=20 ? n(sc.hitRate,50) : 50;
      const coverage=100-n(sc.abstainRate,0);
      const score=0.7*reliability+0.2*coverage+0.1*clamp(n(m.stability,50),0,100);
      return {...m,score,samples,reliability,coverage};
    }).sort((a,b)=>b.score-a.score);
  }

  function learningUpdate(state, observation){
    const ledger=[...(state?.ledger||[]),observation].slice(-10000);
    const driftReport=drift(ledger);
    const regime=observation?.regime||"UNKNOWN";
    const rankings=rankChampions(state?.models||[],ledger,regime);
    return {
      ...state,
      ledger,
      lastUpdate:observation?.timestamp||new Date().toISOString(),
      drift:driftReport,
      rankings
    };
  }

  global.ContinuousLearningV210000={outcome,scorecard,drift,rankChampions,learningUpdate};
})(typeof globalThis!=="undefined"?globalThis:window);
