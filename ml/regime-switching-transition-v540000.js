/*
 V540000 REGIME-SWITCHING AI + MARKET STATE TRANSITION PREDICTOR
 Detects market state, transition pressure, persistence and regime-conditioned
 decision adjustments. Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  const STATES=["TREND_UP","TREND_DOWN","RANGE","BREAKOUT","HIGH_VOLATILITY","PANIC","RECOVERY"];

  function stateScore(f={}){
    return {
      TREND_UP:clamp(.45*n(f.momentum,0)+.30*n(f.trendStrength,0)+.25*n(f.breadth,0),0,100),
      TREND_DOWN:clamp(.45*n(f.downMomentum,0)+.30*n(f.downTrendStrength,0)+.25*n(f.negativeBreadth,0),0,100),
      RANGE:clamp(.55*(100-Math.abs(n(f.momentum,0))*.5)+.45*(100-n(f.volatility,0)),0,100),
      BREAKOUT:clamp(.40*n(f.breakoutPressure,0)+.30*n(f.volumeExpansion,0)+.30*n(f.volatilityExpansion,0),0,100),
      HIGH_VOLATILITY:clamp(.70*n(f.volatility,0)+.30*n(f.ivExpansion,0),0,100),
      PANIC:clamp(.45*n(f.volatilityShock,0)+.30*n(f.downMomentum,0)+.25*n(f.liquidityStress,0),0,100),
      RECOVERY:clamp(.40*n(f.recoveryMomentum,0)+.30*n(f.breadthRecovery,0)+.30*n(f.volatilityCooling,0),0,100)
    };
  }

  function classify(features={}){
    const scores=stateScore(features);
    const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    return {state:ranked[0]?.[0]||"RANGE",scores,
      confidence:clamp((ranked[0]?.[1]||0)-(ranked[1]?.[1]||0)+50,0,100),
      runnerUp:ranked[1]?.[0]||"RANGE"};
  }

  function transition(previous,current,history=[]){
    const prev=previous||"RANGE", cur=current||"RANGE";
    const changed=prev!==cur;
    const recent=history.slice(-10);
    const persistence=recent.filter(x=>x===cur).length/Math.max(1,recent.length);
    return {from:prev,to:cur,changed,persistence,transitionPressure:changed?100*(1-persistence):0};
  }

  function regimeWeights(state,weights={}){
    const defaults={
      TREND_UP:{trend:1.25,momentum:1.15,flow:1.05},
      TREND_DOWN:{trend:1.25,momentum:1.15,flow:1.05},
      RANGE:{trend:.75,momentum:.75,flow:1.10},
      BREAKOUT:{trend:1.10,momentum:1.20,flow:1.20},
      HIGH_VOLATILITY:{trend:.75,momentum:.85,flow:1.20},
      PANIC:{trend:.55,momentum:.65,flow:1.30},
      RECOVERY:{trend:1.00,momentum:1.15,flow:1.15}
    };
    return {...(defaults[state]||defaults.RANGE),...weights};
  }

  function gate(input={}){
    const c=classify(input.features||{});
    const t=transition(input.previousState,c.state,input.history||[]);
    let decision=String(input.direction||"WAIT").toUpperCase();
    if(t.changed && t.persistence<.30) decision="WAIT";
    if(c.confidence<45) decision="WAIT";
    if(c.state==="PANIC" && decision!=="NO-TRADE") decision="WAIT";
    if(input.dataBlocked===true) decision="NO-TRADE";
    return {...c,transition:t,weights:regimeWeights(c.state,input.weights),decision};
  }

  global.RegimeSwitchingV540000={stateScore,classify,transition,regimeWeights,gate,STATES};
})(typeof globalThis!=="undefined"?globalThis:window);
