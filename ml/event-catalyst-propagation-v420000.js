/*
 V420000 EVENT/CATALYST INTELLIGENCE + MARKET IMPACT PROPAGATION
 Models catalyst exposure, propagation paths, time decay and cross-asset transmission.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function normalizeCatalyst(c={}){
    return {
      id:c.id||("CAT-"+Date.now()),
      type:c.type||"UNKNOWN",
      title:c.title||"Unnamed catalyst",
      direction:["BULLISH","BEARISH","MIXED","UNKNOWN"].includes(c.direction)?c.direction:"UNKNOWN",
      impact:clamp(n(c.impact,50),0,100),
      confidence:clamp(n(c.confidence,50),0,100),
      freshness:clamp(n(c.freshness,100),0,100),
      horizon:c.horizon||"SHORT",
      sourceQuality:clamp(n(c.sourceQuality,70),0,100),
      timestamp:c.timestamp||null
    };
  }

  function transmissionScore(edge={}){
    return clamp(
      n(edge.correlation,.5)*100*.35 +
      n(edge.exposure,.5)*100*.35 +
      n(edge.liquidity,.5)*100*.15 +
      n(edge.historicalResponse,.5)*100*.15,0,100
    );
  }

  function propagate(catalyst, graph=[]){
    const c=normalizeCatalyst(catalyst);
    return graph.map(edge=>{
      const t=transmissionScore(edge);
      const directional=(c.direction==="UNKNOWN"||c.direction==="MIXED")?.5:
        (edge.bias==="INVERSE"?-1:1);
      return {
        target:edge.target,
        path:edge.path||[],
        transmissionScore:t,
        projectedDirection:c.direction==="UNKNOWN"?"UNKNOWN":
          c.direction==="MIXED"?"MIXED":
          (directional>0?c.direction:(c.direction==="BULLISH"?"BEARISH":"BULLISH")),
        projectedImpact:clamp(c.impact*(c.confidence/100)*(c.freshness/100)*(t/100),0,100)
      };
    }).sort((a,b)=>b.projectedImpact-a.projectedImpact);
  }

  function catalystPriority(catalyst, now=Date.now()){
    const c=normalizeCatalyst(catalyst);
    const ageHours=c.timestamp?Math.max(0,(now-new Date(c.timestamp).getTime())/3600000):0;
    const decay=Math.exp(-ageHours/Math.max(1,c.horizon==="INTRADAY"?6:c.horizon==="SHORT"?24:72));
    return clamp(c.impact*(c.confidence/100)*(c.sourceQuality/100)*decay,0,100);
  }

  function rankCatalysts(catalysts=[],now=Date.now()){
    return catalysts.map(c=>({...normalizeCatalyst(c),priority:catalystPriority(c,now)}))
      .sort((a,b)=>b.priority-a.priority);
  }

  function instrumentExposure(instrument,catalysts=[],graph=[]){
    const relevant=catalysts.filter(c=>
      !c.targets || c.targets.length===0 || c.targets.includes(instrument)
    );
    const propagated=relevant.flatMap(c=>propagate(c,graph)
      .filter(x=>x.target===instrument)
      .map(x=>({...x,catalystId:c.id,catalystType:c.type})));
    const bull=propagated.filter(x=>x.projectedDirection==="BULLISH")
      .reduce((s,x)=>s+x.projectedImpact,0);
    const bear=propagated.filter(x=>x.projectedDirection==="BEARISH")
      .reduce((s,x)=>s+x.projectedImpact,0);
    const net=clamp(50+(bull-bear),0,100);
    return {instrument,bullishImpact:bull,bearishImpact:bear,netCatalystScore:net,
      catalystRisk:clamp(Math.abs(bull-bear)<10?70:100-Math.min(100,Math.abs(bull-bear)),0,100),
      propagated};
  }

  global.CatalystEngineV420000={
    normalizeCatalyst,transmissionScore,propagate,catalystPriority,rankCatalysts,instrumentExposure
  };
})(typeof globalThis!=="undefined"?globalThis:window);
