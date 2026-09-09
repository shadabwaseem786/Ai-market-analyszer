/*
 V440000 REAL-TIME MARKET REGIME + VOLATILITY STATE MACHINE
 Classifies trend/range/breakout/event/panic/transition and supplies regime
 confidence to downstream models. Research/inference only.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function normalize(x={}){
    return {
      trend:clamp(n(x.trend,50),0,100),
      trendStrength:clamp(n(x.trendStrength,50),0,100),
      volatility:clamp(n(x.volatility,50),0,100),
      volatilityChange:n(x.volatilityChange,0),
      volumeRatio:Math.max(0,n(x.volumeRatio,1)),
      rangeCompression:clamp(n(x.rangeCompression,50),0,100),
      breakoutScore:clamp(n(x.breakoutScore,50),0,100),
      eventRisk:clamp(n(x.eventRisk,0),0,100),
      liquidity:clamp(n(x.liquidity,70),0,100),
      marketBreadth:clamp(n(x.marketBreadth,50),0,100),
      correlationStress:clamp(n(x.correlationStress,30),0,100)
    };
  }

  function classify(input={}){
    const x=normalize(input);
    let state="TRANSITION", confidence=50;
    if(x.eventRisk>=80){state="EVENT"; confidence=x.eventRisk;}
    else if(x.volatility>=85 && x.correlationStress>=70){state="PANIC"; confidence=(x.volatility+x.correlationStress)/2;}
    else if(x.breakoutScore>=80 && x.rangeCompression>=65){state="BREAKOUT"; confidence=(x.breakoutScore+x.rangeCompression)/2;}
    else if(x.trendStrength>=70 && x.trend>=60){state="TRENDING_UP"; confidence=(x.trendStrength+x.trend)/2;}
    else if(x.trendStrength>=70 && x.trend<=40){state="TRENDING_DOWN"; confidence=(x.trendStrength+(100-x.trend))/2;}
    else if(x.volatility<=30 && x.rangeCompression>=60){state="LOW_VOL_COMPRESSION"; confidence=(100-x.volatility+x.rangeCompression)/2;}
    else if(x.liquidity<30 || x.volumeRatio<.5){state="LOW_LIQUIDITY"; confidence=70;}
    else if(x.trendStrength<40 && x.volatility<65){state="RANGE"; confidence=clamp(100-Math.abs(x.trend-50)*1.5,0,100);}
    return {state,confidence,features:x};
  }

  function transition(previous,current){
    const a=previous?.state||"UNKNOWN", b=current?.state||"UNKNOWN";
    return {from:a,to:b,changed:a!==b,shock:
      (a!==b && ["PANIC","EVENT","BREAKOUT"].includes(b))};
  }

  function modelPolicy(state){
    const map={
      TRENDING_UP:{trend:1.2,meanReversion:.7,breakout:1.15},
      TRENDING_DOWN:{trend:1.2,meanReversion:.7,breakout:1.15},
      BREAKOUT:{trend:1.1,meanReversion:.6,breakout:1.35},
      RANGE:{trend:.7,meanReversion:1.25,breakout:.75},
      PANIC:{trend:.6,meanReversion:.5,breakout:.5,risk:.5},
      EVENT:{trend:.7,meanReversion:.6,breakout:.7,risk:.6},
      LOW_VOL_COMPRESSION:{trend:.8,meanReversion:1.0,breakout:1.25},
      LOW_LIQUIDITY:{trend:.5,meanReversion:.5,breakout:.4,risk:.4},
      TRANSITION:{trend:.75,meanReversion:.75,breakout:.8,risk:.7}
    };
    return map[state]||map.TRANSITION;
  }

  function riskMultiplier(state,confidence){
    const base={PANIC:.45,EVENT:.55,LOW_LIQUIDITY:.45,TRANSITION:.75,BREAKOUT:.85,
      TRENDING_UP:1,TRENDING_DOWN:1,RANGE:.9,LOW_VOL_COMPRESSION:.9};
    return clamp(n(base[state],.75)*(n(confidence,50)/100+.5),.25,1.2);
  }

  global.RegimeStateMachineV440000={normalize,classify,transition,modelPolicy,riskMultiplier};
})(typeof globalThis!=="undefined"?globalThis:window);
