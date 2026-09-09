/*
 V370000 MULTI-TIMEFRAME FRACTAL AI + SIGNAL SYNCHRONIZATION
 Aligns independent timeframe signals and penalizes contradictions.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
  const DIR={BUY:1,SELL:-1,WAIT:0,"NO-TRADE":0};

  function normalize(signal){
    const action=String(signal?.action||"WAIT").toUpperCase();
    return {
      timeframe:signal?.timeframe||"UNKNOWN",
      action:DIR[action]===undefined?"WAIT":action,
      probability:clamp(n(signal?.probability,.5),0,1),
      quality:clamp(n(signal?.quality,50),0,100),
      weight:Math.max(.01,n(signal?.weight,1)),
      regime:signal?.regime||null
    };
  }

  function timeframeScore(signals=[]){
    const rows=signals.map(normalize);
    let buy=0,sell=0,wait=0,total=0;
    for(const r of rows){
      const w=r.weight*(r.quality/100);
      total+=w;
      if(r.action==="BUY")buy+=w*r.probability;
      else if(r.action==="SELL")sell+=w*r.probability;
      else wait+=w;
    }
    const denom=Math.max(.0001,total);
    const buyShare=buy/denom, sellShare=sell/denom;
    const dominant=Math.max(buyShare,sellShare);
    const direction=buyShare>sellShare?"BUY":sellShare>buyShare?"SELL":"WAIT";
    return {direction,buyShare,sellShare,dominant,agreement:dominant*100,totalWeight:total};
  }

  function contradictionScore(signals=[]){
    const rows=signals.map(normalize);
    const active=rows.filter(r=>r.action==="BUY"||r.action==="SELL");
    if(active.length<2)return 0;
    let conflict=0,total=0;
    for(const a of active){
      for(const b of active){
        if(a===b)continue;
        const w=a.weight*b.weight;
        total+=w;
        if(a.action!==b.action)conflict+=w;
      }
    }
    return total?100*conflict/total:0;
  }

  function hierarchyAlignment(signals=[], order=["1m","5m","15m","30m","1H","4H","Daily","Weekly"]){
    const map=new Map(signals.map(normalize).map(x=>[x.timeframe,x]));
    const rows=order.filter(x=>map.has(x)).map(x=>map.get(x));
    if(rows.length<2)return {alignment:50,trend:"INSUFFICIENT_TIMEFRAMES"};
    let score=0,weight=0;
    for(let i=1;i<rows.length;i++){
      const a=DIR[rows[i-1].action], b=DIR[rows[i].action];
      const w=rows[i].weight*(rows[i].quality/100);
      weight+=w;
      score+=w*(a===b && a!==0 ? 1 : a===0||b===0 ? .25 : -1);
    }
    const alignment=50+50*(score/Math.max(.0001,weight));
    return {alignment:clamp(alignment,0,100),trend:alignment>=75?"ALIGNED":alignment>=55?"PARTIAL":"CONTRADICTORY"};
  }

  function fractalDecision(signals=[], opts={}){
    const tf=timeframeScore(signals);
    const contradiction=contradictionScore(signals);
    const hierarchy=hierarchyAlignment(signals,opts.order);
    let action=tf.direction;
    let confidence=clamp(50+.5*tf.agreement+.3*hierarchy.alignment-.5*contradiction,0,100);
    if(hierarchy.trend==="CONTRADICTORY" || contradiction>=60) action="WAIT";
    if(tf.totalWeight<1 || hierarchy.trend==="INSUFFICIENT_TIMEFRAMES") action="WAIT";
    return {
      action,
      confidence,
      directionAgreement:tf.agreement,
      hierarchyAlignment:hierarchy.alignment,
      hierarchyTrend:hierarchy.trend,
      contradictionScore:contradiction,
      buyShare:tf.buyShare,
      sellShare:tf.sellShare
    };
  }

  global.FractalSyncV370000={normalize,timeframeScore,contradictionScore,hierarchyAlignment,fractalDecision};
})(typeof globalThis!=="undefined"?globalThis:window);
