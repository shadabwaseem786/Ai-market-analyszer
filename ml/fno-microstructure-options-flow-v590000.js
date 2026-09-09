/*
 V590000 F&O MICROSTRUCTURE + OPTIONS FLOW INTELLIGENCE
 Indian derivatives-focused feature layer.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function oiSignal(priceChange,oiChange){
    const p=n(priceChange), o=n(oiChange);
    if(p>0&&o>0)return "LONG_BUILDUP";
    if(p<0&&o>0)return "SHORT_BUILDUP";
    if(p>0&&o<0)return "SHORT_COVERING";
    if(p<0&&o<0)return "LONG_UNWINDING";
    return "NEUTRAL";
  }

  function optionFlow(x={}){
    const callOI=n(x.callOI), putOI=n(x.putOI);
    const callOIChange=n(x.callOIChange), putOIChange=n(x.putOIChange);
    const callIV=n(x.callIV), putIV=n(x.putIV);
    const volumeCall=n(x.callVolume), volumePut=n(x.putVolume);
    const pcrOI=callOI>0?putOI/callOI:null;
    const pcrVol=volumeCall>0?volumePut/volumeCall:null;
    const ivSkew=putIV-callIV;
    const oiImbalance=callOIChange+putOIChange===0?0:
      (putOIChange-callOIChange)/(Math.abs(putOIChange)+Math.abs(callOIChange));
    return {pcrOI,pcrVol,ivSkew,oiImbalance};
  }

  function futuresBasis(spot,future){
    const s=n(spot), f=n(future);
    return s?((f-s)/s)*100:0;
  }

  function unusualActivity(x={}){
    const volRatio=n(x.volumeRatio,1);
    const oiRatio=n(x.oiRatio,1);
    const ivChange=n(x.ivChange,0);
    const score=clamp(35*clamp(volRatio/3,0,1)+35*clamp(oiRatio/3,0,1)+
      30*clamp(Math.abs(ivChange)/20,0,1),0,100);
    return {score,flag:score>=70?"HIGH":score>=45?"MEDIUM":"NORMAL"};
  }

  function expiryPressure(x={}){
    return clamp(.45*n(x.gammaExposure,0)+.30*n(x.timeDecayPressure,0)+
      .25*n(x.daysToExpiry===undefined?5:Math.max(0,5-n(x.daysToExpiry))),0,100);
  }

  function microstructureScore(x={}){
    const flow=optionFlow(x);
    const activity=unusualActivity(x);
    const basis=futuresBasis(x.spot,x.future);
    const expiry=expiryPressure(x);
    const longBuild=String(oiSignal(x.priceChange,x.oiChange));
    const directional=
      .25*clamp((flow.pcrOI===null?0:flow.pcrOI-1)*50+50,0,100)+
      .25*clamp((flow.oiImbalance+1)*50,0,100)+
      .20*clamp((basis+1)*50,0,100)+
      .15*activity.score+.15*(100-expiry);
    return {flow,activity,basis,expiry,longBuild,
      directionalScore:clamp(directional,0,100)};
  }

  function gate(input={}){
    const s=microstructureScore(input);
    let decision=String(input.direction||"WAIT").toUpperCase();
    if(s.activity.flag==="HIGH" && input.confirmedUnusual!==true) decision="WAIT";
    if(input.dataBlocked===true) decision="NO-TRADE";
    return {...s,decision};
  }

  global.FNOMicrostructureV590000={oiSignal,optionFlow,futuresBasis,
    unusualActivity,expiryPressure,microstructureScore,gate};
})(typeof globalThis!=="undefined"?globalThis:window);
