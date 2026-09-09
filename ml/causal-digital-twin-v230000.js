/*
 V230000 CAUSAL MARKET DIGITAL TWIN + MULTI-MARKET ROUTER
 Research/inference orchestration only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  const MARKETS={
    NSE:{label:"NSE India",currency:"INR",timezone:"Asia/Kolkata",assetClasses:["Equity","Futures","Options"],focus:["NIFTY","BANKNIFTY","F&O"]},
    NASDAQ:{label:"NASDAQ",currency:"USD",timezone:"America/New_York",assetClasses:["Equity","Index","Options"],focus:["NASDAQ","US TECH"]},
    COMMODITY:{label:"Commodity",currency:"USD/INR",timezone:"Asia/Kolkata",assetClasses:["Commodity Futures","Options"],focus:["CRUDE","GOLD","SILVER","NATURAL GAS"]}
  };

  function marketConfig(market){ return MARKETS[String(market||"NSE").toUpperCase()]||MARKETS.NSE; }

  function normalizeState(state={}){
    return {
      price:n(state.price), return1d:n(state.return1d), volatility:n(state.volatility),
      volumeRatio:n(state.volumeRatio,1), breadth:n(state.breadth,50),
      pcr:n(state.pcr,1), oiChange:n(state.oiChange), basis:n(state.basis),
      iv:n(state.iv), ivSkew:n(state.ivSkew), fii:n(state.fii),
      usdInr:n(state.usdInr), crude:n(state.crude), vix:n(state.vix,15),
      rate:n(state.rate), sector:n(state.sector,50)
    };
  }

  // Directional scenario propagation. Coefficients should be learned per market/instrument.
  function causalImpact(base, shocks={}, graph={}){
    const b=normalizeState(base), impacts={};
    for(const [node, shockRaw] of Object.entries(shocks)){
      const shock=n(shockRaw);
      const edges=graph[node]||{};
      for(const [target,coefRaw] of Object.entries(edges)){
        const coef=n(coefRaw);
        impacts[target]=(impacts[target]||0)+shock*coef;
      }
    }
    return {base:b,shocks,impacts};
  }

  function twinScenario(state, scenario, graph){
    const result=causalImpact(state,scenario,graph);
    const total=Object.values(result.impacts).reduce((s,x)=>s+x,0);
    return {...result,scenarioScore:total};
  }

  function compareScenarios(state, scenarios, graph){
    return (scenarios||[]).map(s=>twinScenario(state,s,graph))
      .sort((a,b)=>b.scenarioScore-a.scenarioScore);
  }

  function route(market){
    const cfg=marketConfig(market);
    return {market:String(market||"NSE").toUpperCase(),...cfg};
  }

  function decisionGate(input={}){
    const cfg=route(input.market);
    const quality=clamp(n(input.dataQuality,100),0,100);
    const causal=clamp(n(input.causalConfidence,50),0,100);
    const adversarial=clamp(n(input.warRoomConfidence,50),0,100);
    const calibration=clamp(n(input.calibration,50),0,100);
    let action="WAIT";
    if(quality<60 || adversarial<45) action="NO-TRADE";
    else if(causal>=75 && calibration>=70 && adversarial>=65) action=n(input.directionScore)>=0?"BUY":"SELL";
    return {market:cfg.label,action,quality,causalConfidence:causal,warRoomConfidence:adversarial,calibration};
  }

  global.DigitalTwinV230000={MARKETS,marketConfig,normalizeState,causalImpact,twinScenario,compareScenarios,route,decisionGate};
})(typeof globalThis!=="undefined"?globalThis:window);
