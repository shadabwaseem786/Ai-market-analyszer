/*
 V430000 OPTIONS/F&O MICROSTRUCTURE + SMART MONEY FLOW ENGINE
 Derives normalized pressure signals from OI, volume, IV, skew, basis,
 rollover and price/OI relationships. Research/inference only.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function oiPriceSignal(priceChangePct,oiChangePct){
    const p=n(priceChangePct), oi=n(oiChangePct);
    if(p>0&&oi>0)return {label:"LONG_BUILDUP",score:80};
    if(p<0&&oi>0)return {label:"SHORT_BUILDUP",score:80};
    if(p>0&&oi<0)return {label:"SHORT_COVERING",score:65};
    if(p<0&&oi<0)return {label:"LONG_UNWINDING",score:65};
    return {label:"NEUTRAL",score:50};
  }

  function futuresBasis(spot,future){
    const s=n(spot), f=n(future);
    if(!s)return {basisPct:0,state:"UNKNOWN"};
    const b=(f-s)/s*100;
    return {basisPct:b,state:b>0.25?"POSITIVE":b<-0.25?"NEGATIVE":"FLAT"};
  }

  function ivState(iv,ivRank){
    const x=clamp(n(ivRank,50),0,100);
    return {iv:n(iv,0),ivRank:x,state:x>=80?"EXTREME_HIGH":x>=60?"HIGH":x<=20?"LOW":"NORMAL"};
  }

  function skewSignal(putIV,callIV){
    const p=n(putIV), c=n(callIV);
    const skew=p-c;
    return {skew,signal:skew>3?"DOWNSIDE_HEDGE_DEMAND":skew<-3?"UPSIDE_CALL_DEMAND":"BALANCED"};
  }

  function flowScore(input={}){
    const oi=oiPriceSignal(input.priceChangePct,input.oiChangePct);
    const basis=futuresBasis(input.spot,input.future);
    const iv=ivState(input.iv,input.ivRank);
    const skew=skewSignal(input.putIV,input.callIV);
    const volumeRatio=Math.max(0,n(input.volumeRatio,1));
    const pcr=n(input.pcr,1);

    let directional=50;
    if(oi.label==="LONG_BUILDUP")directional+=15;
    if(oi.label==="SHORT_BUILDUP")directional-=15;
    if(oi.label==="SHORT_COVERING")directional+=8;
    if(oi.label==="LONG_UNWINDING")directional-=8;
    if(basis.state==="POSITIVE")directional+=8;
    if(basis.state==="NEGATIVE")directional-=8;
    if(pcr>1.2)directional+=5;
    if(pcr<.8)directional-=5;

    const conviction=clamp(
      40 + Math.min(30,Math.max(0,(volumeRatio-1)*20)) +
      Math.abs(directional-50)*.7 +
      (iv.state==="EXTREME_HIGH"?-10:0),0,100);

    return {
      directionalScore:clamp(directional,0,100),
      bias:directional>=58?"BULLISH":directional<=42?"BEARISH":"MIXED",
      conviction,
      oiSignal:oi,
      basis,
      iv,
      skew,
      pcr,
      volumeRatio
    };
  }

  function anomalyScore(current={},baseline={}){
    const keys=["volumeRatio","oiChangePct","ivRank","pcr"];
    let hits=0;
    for(const k of keys){
      if(k in current && k in baseline){
        const diff=Math.abs(n(current[k])-n(baseline[k]));
        const limit=k==="volumeRatio"?1:k==="ivRank"?25:k==="pcr"?.35:10;
        if(diff>limit)hits++;
      }
    }
    return clamp(hits/keys.length*100,0,100);
  }

  global.MicrostructureV430000={oiPriceSignal,futuresBasis,ivState,skewSignal,flowScore,anomalyScore};
})(typeof globalThis!=="undefined"?globalThis:window);
