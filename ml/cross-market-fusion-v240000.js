/*
 V240000 CROSS-MARKET FUSION ENGINE
 Cross-market context and lead/lag evidence. Research/inference only.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  const LINKS={
    NASDAQ_TO_NSE_IT:{source:"NASDAQ",target:"NSE_IT",weight:.65},
    US_FUTURES_TO_NIFTY:{source:"US_FUTURES",target:"NIFTY",weight:.45},
    CRUDE_TO_INDIAN_ENERGY:{source:"CRUDE",target:"NSE_ENERGY",weight:.55},
    CRUDE_TO_INFLATION:{source:"CRUDE",target:"INDIA_INFLATION",weight:.35},
    GOLD_TO_RISK_OFF:{source:"GOLD",target:"RISK_OFF",weight:.30},
    USDINR_TO_IT:{source:"USDINR",target:"NSE_IT",weight:.40},
    USDINR_TO_NIFTY:{source:"USDINR",target:"NIFTY",weight:-.20},
    GLOBAL_VOL_TO_FNO:{source:"GLOBAL_VOL",target:"NSE_FNO_RISK",weight:.60}
  };

  function fuse(observations, links=LINKS){
    const out={}, evidence=[];
    for(const [name,l] of Object.entries(links)){
      const src=observations?.[l.source];
      if(src==null) continue;
      const impact=n(src)*n(l.weight);
      out[l.target]=(out[l.target]||0)+impact;
      evidence.push({link:name,source:l.source,target:l.target,impact});
    }
    return {impacts:out,evidence,coverage:evidence.length/Object.keys(links).length*100};
  }

  function confirmation(input={}){
    const signals=input.signals||[];
    const valid=signals.filter(x=>Number.isFinite(Number(x.score)));
    if(!valid.length)return {score:50,agreement:0,coverage:0,status:"INSUFFICIENT"};
    const score=valid.reduce((s,x)=>s+n(x.score)*n(x.weight,1),0)/
      valid.reduce((s,x)=>s+n(x.weight,1),0);
    const mean=score;
    const spread=Math.sqrt(valid.reduce((s,x)=>s+n(x.weight,1)*Math.pow(n(x.score)-mean,2),0)/
      valid.reduce((s,x)=>s+n(x.weight,1),0));
    const agreement=clamp(100-spread*2,0,100);
    return {score,agreement,coverage:clamp(valid.length/Math.max(1,signals.length)*100,0,100),
      status:agreement>=70?"CONFIRMED":agreement>=50?"MIXED":"CONFLICTED"};
  }

  function gate(input={}){
    const q=clamp(n(input.dataQuality,100),0,100);
    const c=clamp(n(input.crossMarketConfidence,50),0,100);
    const a=clamp(n(input.agreement,50),0,100);
    if(q<60)return "NO-TRADE";
    if(a<45)return "WAIT";
    if(c>=72 && a>=65)return n(input.directionScore)>=0?"BUY":"SELL";
    return "WAIT";
  }

  global.CrossMarketFusionV240000={LINKS,fuse,confirmation,gate};
})(typeof globalThis!=="undefined"?globalThis:window);
