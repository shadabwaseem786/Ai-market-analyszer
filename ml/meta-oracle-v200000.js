/*
 V200000 SELF-CALIBRATING META-ORACLE
 Research/inference orchestration layer. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function normalize(p){
    const x=n(p,50);
    return clamp(x>1?x:x*100,0,100);
  }

  function weightedMean(items){
    let s=0,w=0;
    for(const i of items||[]){
      const weight=Math.max(0,n(i.weight,1));
      if(Number.isFinite(Number(i.value))){s+=Number(i.value)*weight;w+=weight;}
    }
    return w?s/w:50;
  }

  function modelReliability(history, model, regime){
    const rows=(history||[]).filter(x=>x.model===model && (!regime||x.regime===regime));
    if(!rows.length)return {samples:0,score:50,decay:0};
    const recent=rows.slice(-100);
    const hit=recent.filter(x=>Boolean(x.correct)).length/recent.length;
    const agePenalty=Math.min(25,Math.max(0,(rows.length-recent.length)*0.1));
    return {samples:rows.length,score:clamp(hit*100-agePenalty,0,100),decay:agePenalty};
  }

  function selectWeights(models, performance, regime){
    const out=[];
    for(const m of models||[]){
      const r=performance?.[m.name]||modelReliability([],m.name,regime);
      const quality=clamp(n(r.score,50),1,100);
      out.push({...m,weight:Math.pow(quality/100,2)});
    }
    const total=out.reduce((s,x)=>s+x.weight,0)||1;
    return out.map(x=>({...x,weight:x.weight/total}));
  }

  function metaOracle(input={}){
    const regime=input.regime||"UNKNOWN";
    const models=input.models||[];
    const weights=selectWeights(models,input.performance,regime);
    const p=weightedMean(weights.map(m=>({value:normalize(m.probability),weight:m.weight})));
    const spread=weights.length ? Math.sqrt(weights.reduce((s,m)=>s+m.weight*Math.pow(normalize(m.probability)-p,2),0)) : 50;
    const memory=n(input.marketMemoryAlignment,0);
    const fo=n(input.foEvidence,0);
    const dataQuality=clamp(n(input.dataQuality,100),0,100);
    const risk=n(input.riskScore,50);
    const robustness=clamp(n(input.robustness,50),0,100);
    const agreement=clamp(100-spread*2,0,100);

    const raw=p + memory + fo;
    const penalty=(100-dataQuality)*0.25 + risk*0.20 + (100-robustness)*0.20 + (100-agreement)*0.20;
    const calibrated=clamp(raw/3 - penalty*0.35 + 50,0,100);

    let action="WAIT";
    if(dataQuality<60 || robustness<45 || agreement<50) action="NO-TRADE";
    else if(calibrated>=72) action="BUY";
    else if(calibrated<=28) action="SELL";

    return {
      action, calibratedProbability:calibrated, rawEnsembleProbability:p,
      modelAgreement:agreement, modelSpread:spread, regime,
      dataQuality, riskScore:risk, robustness, weights,
      reasons:{
        marketMemory:memory, foEvidence:fo,
        penalty
      }
    };
  }

  function recordOutcome(ledger, prediction){
    const row={...prediction, timestamp:prediction.timestamp||new Date().toISOString()};
    return [...(ledger||[]),row].slice(-5000);
  }

  global.MetaOracleV200000={normalize,weightedMean,modelReliability,selectWeights,metaOracle,recordOutcome};
})(typeof globalThis!=="undefined"?globalThis:window);
