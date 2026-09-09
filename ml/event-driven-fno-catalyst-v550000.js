/*
 V550000 EVENT-DRIVEN F&O INTELLIGENCE + CATALYST IMPACT FORECASTING
 Scores event credibility, impact, timing, F&O sensitivity and regime interaction.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function normalizeEvent(e={}){
    const type=String(e.type||"OTHER").toUpperCase();
    return {id:e.id||e.name||"event",name:e.name||e.id||"event",type,
      credibility:clamp(n(e.credibility,50),0,100),
      probability:clamp(n(e.probability,.5),0,1),
      magnitude:clamp(n(e.magnitude,50),0,100),
      timeToImpact:n(e.timeToImpact,24),
      duration:n(e.duration,1),
      fnoSensitivity:clamp(n(e.fnoSensitivity,50),0,100),
      regimeInteraction:clamp(n(e.regimeInteraction,50),0,100),
      direction:String(e.direction||"NEUTRAL").toUpperCase(),
      sourceCount:n(e.sourceCount,1)
    };
  }

  function eventScore(e={}){
    const x=normalizeEvent(e);
    const timing=clamp(100/(1+Math.max(0,x.timeToImpact)/24),0,100);
    const sourceBoost=clamp(50+10*Math.min(5,x.sourceCount-1),50,100);
    const impact=clamp(.30*x.magnitude+.25*x.fnoSensitivity+
      .20*x.regimeInteraction+.15*x.credibility+.10*sourceBoost,0,100);
    const weightedImpact=impact*x.probability/100;
    return {...x,timing,impactScore:impact,weightedImpact};
  }

  function aggregate(events=[]){
    const rows=events.map(eventScore);
    let bull=0,bear=0;
    rows.forEach(x=>{
      if(x.direction==="BULLISH"||x.direction==="BUY") bull+=x.weightedImpact;
      if(x.direction==="BEARISH"||x.direction==="SELL") bear+=x.weightedImpact;
    });
    const total=bull+bear||1;
    return {events:rows.sort((a,b)=>b.weightedImpact-a.weightedImpact),
      bullishImpact:bull,bearishImpact:bear,
      netImpact:bull-bear,
      directionalConfidence:clamp(Math.abs(bull-bear)/total*100,0,100)};
  }

  function timeBuckets(events=[]){
    const rows=events.map(eventScore);
    return {
      immediate:rows.filter(x=>x.timeToImpact<=4),
      nearTerm:rows.filter(x=>x.timeToImpact>4&&x.timeToImpact<=24),
      shortTerm:rows.filter(x=>x.timeToImpact>24&&x.timeToImpact<=168),
      later:rows.filter(x=>x.timeToImpact>168)
    };
  }

  function gate(input={}){
    const a=aggregate(input.events||[]);
    let decision=String(input.direction||"WAIT").toUpperCase();
    if(a.directionalConfidence<20) decision="WAIT";
    if(n(input.catalystConflict,0)>=70) decision="WAIT";
    if(input.dataBlocked===true) decision="NO-TRADE";
    return {...a,buckets:timeBuckets(input.events||[]),decision};
  }

  global.EventDrivenFNOV550000={normalizeEvent,eventScore,aggregate,timeBuckets,gate};
})(typeof globalThis!=="undefined"?globalThis:window);
