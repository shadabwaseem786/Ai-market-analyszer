/*
 V560000 CROSS-MARKET LEAD/LAG + INTERMARKET TRANSMISSION AI
 Measures leader/lagger relationships, transmission pressure, confirmation,
 and cross-market conflict. Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function normalize(m={}){
    return {id:m.id||m.name||"market",name:m.name||m.id||"market",
      return:n(m.return,0),momentum:n(m.momentum,0),volume:n(m.volume,0),
      volatility:n(m.volatility,0),timestamp:m.timestamp||null,
      liquidity:n(m.liquidity,50)};
  }

  function leadLag(leader={},lagger={},params={}){
    const a=normalize(leader), b=normalize(lagger);
    const horizon=n(params.horizon,1);
    const momentumLead=a.momentum-b.momentum;
    const returnLead=a.return-b.return;
    const volumeLead=a.volume-b.volume;
    const transmission=clamp(
      .35*Math.abs(momentumLead)+.30*Math.abs(returnLead)+
      .20*Math.abs(volumeLead)+.15*Math.abs(a.liquidity-b.liquidity),0,100);
    const direction=momentumLead>0||returnLead>0?"BULLISH":
      momentumLead<0||returnLead<0?"BEARISH":"NEUTRAL";
    return {leader:a.name,lagger:b.name,horizon,momentumLead,returnLead,
      volumeLead,transmission,direction};
  }

  function rankMarkets(markets=[]){
    return markets.map(x=>{
      const m=normalize(x);
      const leadership=clamp(.40*Math.abs(m.momentum)+.30*Math.abs(m.return)+
        .20*Math.abs(m.volume)+.10*m.liquidity,0,100);
      return {...m,leadership};
    }).sort((a,b)=>b.leadership-a.leadership);
  }

  function transmissionMatrix(markets=[],edges=[]){
    const map=Object.fromEntries(markets.map(x=>[x.id||x.name,x]));
    return edges.map(e=>leadLag(map[e.from]||e.from,map[e.to]||e.to,e));
  }

  function aggregate(markets=[],edges=[]){
    const ranked=rankMarkets(markets);
    const matrix=transmissionMatrix(markets,edges);
    const bullish=matrix.filter(x=>x.direction==="BULLISH").reduce((s,x)=>s+x.transmission,0);
    const bearish=matrix.filter(x=>x.direction==="BEARISH").reduce((s,x)=>s+x.transmission,0);
    const total=bullish+bearish||1;
    return {leader:ranked[0]?.name||"UNKNOWN",ranked,matrix,
      bullishTransmission:bullish,bearishTransmission:bearish,
      netTransmission:bullish-bearish,
      confirmation:clamp(Math.abs(bullish-bearish)/total*100,0,100)};
  }

  function gate(input={}){
    const a=aggregate(input.markets||[],input.edges||[]);
    let decision=String(input.direction||"WAIT").toUpperCase();
    if(a.confirmation<20) decision="WAIT";
    if(input.crossMarketConflict===true) decision="WAIT";
    if(input.dataBlocked===true) decision="NO-TRADE";
    return {...a,decision};
  }

  global.CrossMarketV560000={normalize,leadLag,rankMarkets,transmissionMatrix,aggregate,gate};
})(typeof globalThis!=="undefined"?globalThis:window);
