/*
 * V190000 MARKET MEMORY + HISTORICAL ANALOG ENGINE
 * Research component: no live data fabrication and no order execution.
 */
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const num=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function vectorize(s){
    return {
      trend:num(s.trend), momentum:num(s.momentum), rsi:num(s.rsi,50),
      volume:num(s.volumeRatio,1), volatility:num(s.volatility),
      pcr:num(s.pcr,1), iv:num(s.iv), ivSkew:num(s.ivSkew),
      oiChange:num(s.oiChange), basis:num(s.basis),
      fii:num(s.fiiPosition), vix:num(s.vix,15), breadth:num(s.breadth,50)
    };
  }

  function distance(a,b){
    const keys=Object.keys(a), scales={
      trend:100,momentum:100,rsi:50,volume:2,volatility:10,pcr:1,iv:20,
      ivSkew:10,oiChange:100,basis:5,fii:100,vix:20,breadth:50
    };
    let sum=0,w=0;
    for(const k of keys){
      const scale=scales[k]||1, d=(num(a[k])-num(b[k]))/scale;
      sum += d*d; w++;
    }
    return Math.sqrt(sum/Math.max(1,w));
  }

  function outcomeLabel(r){
    const x=num(r.forwardReturn);
    if(x>num(r.upBarrier,1)) return "UP";
    if(x<num(r.downBarrier,-1)) return "DOWN";
    return "TIME";
  }

  function findAnalogs(current, history, options={}){
    const k=Math.max(3,Math.min(50,num(options.k,15)));
    const cur=vectorize(current);
    const scored=(Array.isArray(history)?history:[]).map((r,i)=>({
      index:i, distance:distance(cur,vectorize(r)), outcome:outcomeLabel(r),
      forwardReturn:num(r.forwardReturn), regime:r.regime||"UNKNOWN", date:r.date||null
    })).sort((a,b)=>a.distance-b.distance).slice(0,k);

    const n=scored.length||1;
    const up=scored.filter(x=>x.outcome==="UP").length/n;
    const down=scored.filter(x=>x.outcome==="DOWN").length/n;
    const time=scored.filter(x=>x.outcome==="TIME").length/n;
    const avg=scored.reduce((s,x)=>s+x.forwardReturn,0)/n;
    const concentration=Math.max(up,down,time);
    const analogConfidence=clamp((concentration*100)*(1/(1+(scored[0]?.distance||1))),0,100);

    return {
      matches:scored,
      distribution:{up:up*100,down:down*100,time:time*100},
      avgForwardReturn:avg,
      analogConfidence,
      nearestDistance:scored[0]?.distance ?? null,
      regimeConsensus: scored.length ? (
        Object.entries(scored.reduce((m,x)=>(m[x.regime]=(m[x.regime]||0)+1,m),{}))
          .sort((a,b)=>b[1]-a[1])[0][0]
      ) : "UNKNOWN"
    };
  }

  function fuseSignal(signal, analog){
    if(!analog) return {...signal, marketMemory:null};
    const dir=String(signal.bias||"").toUpperCase();
    const memoryBull=analog.distribution.up-analog.distribution.down;
    const aligned=(dir==="BULLISH"&&memoryBull>0)||(dir==="BEARISH"&&memoryBull<0);
    const conflict=(dir==="BULLISH"&&memoryBull<-15)||(dir==="BEARISH"&&memoryBull>15);
    const adjustment=conflict?-12:(aligned?8:0);
    return {
      ...signal,
      marketMemory:{
        ...analog,
        alignment:aligned?"CONFIRMS":conflict?"CONFLICTS":"NEUTRAL",
        scoreAdjustment:adjustment
      }
    };
  }

  global.MarketMemoryV190000={vectorize,distance,findAnalogs,fuseSignal};
})(typeof globalThis!=="undefined"?globalThis:window);
