/*
 V250000 REAL-TIME SIGNAL CONVERGENCE + TRADE SETUP ENGINE
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function decay(ageMinutes, halfLifeMinutes){
    if(ageMinutes<=0)return 1;
    const h=Math.max(1,n(halfLifeMinutes,120));
    return Math.pow(0.5,ageMinutes/h);
  }

  function convergence(signals, nowMs){
    const valid=(signals||[]).filter(s=>s && s.direction);
    let bull=0,bear=0,total=0;
    for(const s of valid){
      const age=(nowMs-n(s.timestampMs,nowMs))/60000;
      const freshness=decay(Math.max(0,age),n(s.halfLifeMinutes,120));
      const weight=Math.max(0,n(s.weight,1))*freshness;
      const strength=clamp(n(s.strength,50),0,100);
      total+=weight;
      if(String(s.direction).toUpperCase()==="BUY")bull+=weight*strength;
      if(String(s.direction).toUpperCase()==="SELL")bear+=weight*strength;
    }
    const denom=Math.max(1,total);
    const b=bull/denom, r=bear/denom;
    const edge=b-r;
    return {
      bull:b,bear:r,edge,
      agreement:clamp(100-Math.abs(edge)*0.8,0,100),
      freshness:valid.length?valid.reduce((s,x)=>s+decay(Math.max(0,(nowMs-n(x.timestampMs,nowMs))/60000),n(x.halfLifeMinutes,120)),0)/valid.length*100:0
    };
  }

  function expiry(signal, nowMs){
    const age=Math.max(0,(nowMs-n(signal.timestampMs,nowMs))/60000);
    const half=n(signal.halfLifeMinutes,120);
    const remaining=Math.max(0,half*2-age);
    return {ageMinutes:age,remainingMinutes:remaining,expired:age>=half*2};
  }

  function setup(input={}){
    const now=n(input.nowMs,Date.now());
    const conv=convergence(input.signals||[],now);
    const q=clamp(n(input.dataQuality,100),0,100);
    const risk=clamp(n(input.riskScore,50),0,100);
    const calibrated=clamp(n(input.calibratedProbability,50),0,100);
    const directionScore=n(input.directionScore,0);
    const exp=input.signalTimestampMs!=null?expiry({
      timestampMs:input.signalTimestampMs,
      halfLifeMinutes:n(input.halfLifeMinutes,120)
    },now):{expired:false,remainingMinutes:null,ageMinutes:0};

    let action="WAIT";
    if(q<60 || risk>=80 || exp.expired) action="NO-TRADE";
    else if(conv.agreement>=65 && calibrated>=72 && directionScore>0) action="BUY";
    else if(conv.agreement>=65 && calibrated<=28 && directionScore<0) action="SELL";

    return {
      action,
      confidence:clamp((calibrated*.55)+(conv.agreement*.25)+(q*.10)+((100-risk)*.10),0,100),
      convergence:conv,
      expiry:exp,
      setup:{
        entryZone:input.entryZone||null,
        target:input.target||null,
        invalidation:input.invalidation||null,
        expectedMove:input.expectedMove||null,
        signalExpiry:exp.remainingMinutes
      }
    };
  }

  global.SignalConvergenceV250000={decay,convergence,expiry,setup};
})(typeof globalThis!=="undefined"?globalThis:window);
