/*
 V310000 AI MARKET MEMORY 2.0
 Historical analog search + regime replay + outcome-conditioned evidence.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function normalize(v, min, max){
    if(max===min)return .5;
    return clamp((n(v,min)-min)/(max-min),0,1);
  }

  function distance(current, historical, schema={}){
    const keys=Object.keys(schema);
    if(!keys.length)return 1;
    let sum=0, weightSum=0;
    for(const k of keys){
      const s=schema[k]||{};
      const w=Math.max(.01,n(s.weight,1));
      const d=Math.abs(normalize(current[k],n(s.min,0),n(s.max,1))-
                       normalize(historical[k],n(s.min,0),n(s.max,1)));
      sum+=w*d; weightSum+=w;
    }
    return sum/Math.max(.01,weightSum);
  }

  function similarity(current,historical,schema={}){
    return clamp(100*(1-distance(current,historical,schema)),0,100);
  }

  function search(current, history=[], schema={}, filters={}){
    const minSim=n(filters.minSimilarity,60);
    const regime=filters.regime;
    const market=filters.market;
    return history
      .filter(h=>(!regime || h.regime===regime) && (!market || h.market===market))
      .map(h=>({...h,similarity:similarity(current,h.state||h,schema)}))
      .filter(h=>h.similarity>=minSim)
      .sort((a,b)=>b.similarity-a.similarity)
      .slice(0,Math.max(1,n(filters.topK,20)));
  }

  function replay(analogs=[], outcomeKey="forwardReturn"){
    if(!analogs.length)return {sampleSize:0,meanReturn:0,winRate:50,confidence:0};
    let weighted=0, wsum=0, wins=0;
    for(const a of analogs){
      const w=Math.pow(clamp(n(a.similarity,0)/100,0,1),2);
      const ret=n(a[outcomeKey],0);
      weighted+=ret*w; wsum+=w;
      if(ret>0)wins+=w;
    }
    const mean=weighted/Math.max(.0001,wsum);
    const winRate=wins/Math.max(.0001,wsum)*100;
    const confidence=clamp(
      Math.min(100,analogs.length*5)*.35+
      clamp(Math.abs(winRate-50)*2,0,100)*.35+
      clamp(Math.abs(mean)*10,0,100)*.30,0,100);
    return {sampleSize:analogs.length,meanReturn:mean,winRate,confidence};
  }

  function memorySignal(input={}){
    const analogs=search(input.currentState||{},input.history||[],input.schema||{},{
      regime:input.regime,market:input.market,minSimilarity:input.minSimilarity,topK:input.topK
    });
    const replayed=replay(analogs,input.outcomeKey||"forwardReturn");
    const direction=replayed.meanReturn>0?"BUY":replayed.meanReturn<0?"SELL":"WAIT";
    return {analogs,replay:replayed,direction};
  }

  global.MarketMemoryV310000={normalize,distance,similarity,search,replay,memorySignal};
})(typeof globalThis!=="undefined"?globalThis:window);
