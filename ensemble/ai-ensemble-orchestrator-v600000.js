/* V600000 AI ENSEMBLE FUSION + MODEL ORCHESTRATION */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 function weightedVote(models=[]){let sw=0,ss=0;for(const m of models){const w=clamp(n(m.weight,.5),0,1),s=clamp(n(m.score,.5),0,1);sw+=w;ss+=w*s}return{score:clamp(ss/(sw||1),0,1),totalWeight:sw}}
 function disagreement(models=[]){const a=models.map(m=>n(m.score,.5));if(a.length<2)return 0;return Math.sqrt(mean(a.map(x=>(x-mean(a))**2)))}
 function regimeWeights(models=[],regime){return models.map(m=>({...m,weight:clamp(n(m.baseWeight,.5)*n(m.regimeMultipliers?.[regime],1),0,1)}))}
 function ensemble(models=[],regime){const weighted=regimeWeights(models,regime),vote=weightedVote(weighted),dis=disagreement(weighted);return{score:vote.score,disagreement:dis,models:weighted,confidence:clamp(vote.score*(1-dis),0,1),regime}}
 function drift(reference=[],current=[]){const a=mean(reference),b=mean(current),sd=Math.sqrt(mean(reference.map(x=>(n(x)-a)**2)))||1;const z=(b-a)/sd;return{referenceMean:a,currentMean:b,z,drifted:Math.abs(z)>=2}}
 function featureDrift(features={}){return Object.fromEntries(Object.entries(features).map(([k,v])=>[k,drift(v.reference||[],v.current||[])]))}
 function modelDrift(history=[],recent=[]){return drift(history,recent)}
 function health(x={}){const fd=featureDrift(x.features||{}),bad=Object.values(fd).filter(v=>v.drifted).length,md=modelDrift(x.modelHistory||[],x.recentModelScores||[]);return{featureDriftCount:bad,modelDrift:md,healthy:bad===0&&!md.drifted}}
 function safeFallback(primary,ensembleResult,healthState){if(!healthState.healthy||ensembleResult.disagreement>.25)return{...primary,mode:"FALLBACK",reason:!healthState.healthy?"DRIFT":"MODEL_DISAGREEMENT"};return{...primary,mode:"ENSEMBLE"}}
 function explain(models=[]){const total=models.reduce((s,m)=>s+Math.abs(n(m.contribution)),0)||1;return models.map(m=>({...m,normalizedContribution:n(m.contribution)/total})).sort((a,b)=>Math.abs(b.normalizedContribution)-Math.abs(a.normalizedContribution))}
 function shadow(models=[],live){return models.map(m=>({name:m.name,shadowScore:n(m.score,.5),liveScore:n(live?.[m.name],.5),delta:n(m.score,.5)-n(live?.[m.name],.5)}))}
 function stack(features=[],meta={bias:0,weights:[]}){return 1/(1+Math.exp(-(n(meta.bias)+features.reduce((s,x,i)=>s+n(x)*n(meta.weights?.[i]),0))))}
 function orchestrate(input={}){const ens=ensemble(input.models||[],input.regime),hs=health(input);return{ensemble:ens,health:hs,fallback:safeFallback(input.primaryDecision||{action:"WAIT"},ens,hs),explainability:explain(input.models||[]),shadow:shadow(input.shadowModels||[],input.liveScores||{})}}
 global.AIEnsembleV600000={weightedVote,disagreement,regimeWeights,ensemble,drift,featureDrift,modelDrift,health,safeFallback,explain,shadow,stack,orchestrate};
})(typeof globalThis!=="undefined"?globalThis:window);