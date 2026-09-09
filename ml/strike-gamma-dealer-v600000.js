/*
 V600000 STRIKE-LEVEL INTELLIGENCE + GAMMA/DEALER POSITIONING
 Models option-chain strike concentrations, Greeks, gamma walls, expected move
 and expiry-aware price zones. Research only; no order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function strike(row={}){
    return {
      strike:n(row.strike),callOI:n(row.callOI),putOI:n(row.putOI),
      callOIChange:n(row.callOIChange),putOIChange:n(row.putOIChange),
      callIV:n(row.callIV),putIV:n(row.putIV),
      callGamma:n(row.callGamma),putGamma:n(row.putGamma),
      callDelta:n(row.callDelta),putDelta:n(row.putDelta),
      callVolume:n(row.callVolume),putVolume:n(row.putVolume)
    };
  }

  function gammaExposure(row={}){
    const r=strike(row);
    const call=r.callGamma*r.callOI;
    const put=r.putGamma*r.putOI;
    return {strike:r.strike,callGammaExposure:call,putGammaExposure:put,
      netGamma:call-put,absGamma:Math.abs(call)+Math.abs(put)};
  }

  function gammaMap(chain=[]){
    return chain.map(gammaExposure).sort((a,b)=>b.absGamma-a.absGamma);
  }

  function walls(chain=[],topN=5){
    const rows=chain.map(r=>{
      const x=strike(r);
      return {strike:x.strike,callOI:x.callOI,putOI:x.putOI,
        callWall:x.callOI,putWall:x.putOI,
        callOIChange:x.callOIChange,putOIChange:x.putOIChange};
    });
    return {
      callWalls:[...rows].sort((a,b)=>b.callWall-a.callWall).slice(0,topN),
      putWalls:[...rows].sort((a,b)=>b.putWall-a.putWall).slice(0,topN)
    };
  }

  function expectedMove(spot,iv,days=1){
    const s=n(spot), v=n(iv)/100, d=Math.max(n(days,1),.01)/365;
    return s*v*Math.sqrt(d);
  }

  function priceZones(spot,move){
    const s=n(spot), m=Math.abs(n(move));
    return {lower:s-m,upper:s+m,lower2:s-2*m,upper2:s+2*m};
  }

  function dealerPressure(chain=[]){
    const g=gammaMap(chain);
    const net=g.reduce((s,x)=>s+x.netGamma,0);
    const gross=g.reduce((s,x)=>s+x.absGamma,0)||1;
    return {netGamma:net,grossGamma:gross,
      normalizedGamma:clamp((net/gross+1)*50,0,100),
      regime:net>0?"POSITIVE_GAMMA":net<0?"NEGATIVE_GAMMA":"NEUTRAL_GAMMA"};
  }

  function probableZones(input={}){
    const em=expectedMove(input.spot,input.atmIV,input.daysToExpiry);
    return {...priceZones(input.spot,em),expectedMove:em};
  }

  function analyze(input={}){
    const gamma=gammaMap(input.chain||[]);
    const wall=walls(input.chain||[],input.topN||5);
    const dealer=dealerPressure(input.chain||[]);
    const zones=probableZones(input);
    let decision=String(input.direction||"WAIT").toUpperCase();
    if(input.dataBlocked===true) decision="NO-TRADE";
    if(input.chainConflict===true) decision="WAIT";
    return {gamma,walls:wall,dealer,zones,decision};
  }

  global.StrikeGammaV600000={strike,gammaExposure,gammaMap,walls,expectedMove,
    priceZones,dealerPressure,probableZones,analyze};
})(typeof globalThis!=="undefined"?globalThis:window);
