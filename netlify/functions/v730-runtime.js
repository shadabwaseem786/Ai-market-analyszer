const marketModule=require("./market-data.js");
const catalystModule=require("./catalyst-feed.js");
const ai=require("./ai-engine.js");

const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||0));

function catalystUsable(c){
  return Number(c?.count||0)>0 &&
    Number(c?.catalystHealth||0)>0 &&
    Number(c?.catalystConfidence||0)>=45 &&
    Number(c?.catalystFreshness||0)>0;
}

function combine(m,c,a){
  const marketConfidence=clamp(m?.confidence,0,95);
  const catalystConfidence=clamp(c?.catalystConfidence,0,95);
  const aiConfidence=clamp(a?.confidence,0,95);
  const risk=clamp(
    0.45*clamp(m?.riskScore,0,100)+
    0.35*clamp(c?.catalystRisk,0,100)+
    0.20*clamp(a?.uncertainty,0,100),0,100
  );
  const confidence=clamp(
    Math.round(0.45*marketConfidence+0.30*catalystConfidence+0.25*aiConfidence-risk*0.10),0,95
  );
  const score=clamp(m?.score,0,100);
  const aiProbability=clamp(a?.aiProbability,2,98);
  const catalystBias=String(c?.weightedBias||c?.catalystBias||"NEUTRAL");
  const gate=(Number(m?.dataHealth||0)>=50 && catalystUsable(c) && confidence>=55 && risk<70)?"PASS":"HOLD";

  let decision="WAIT";
  if(gate==="PASS"){
    const bullish=(score>=70?2:0)+(aiProbability>=60?1:0)+(catalystBias==="BULLISH"?1:0);
    const bearish=(score<=30?2:0)+(aiProbability<=40?1:0)+(catalystBias==="BEARISH"?1:0);
    if(bullish>=3 && bullish>bearish) decision="BUY";
    else if(bearish>=3 && bearish>bullish) decision="SELL";
  }
  return {decision,confidence,riskScore:Math.round(risk),gate,marketScore:score,aiProbability,catalystBias};
}

async function invoke(fn){
  const r=await fn({httpMethod:"GET",headers:{},body:null});
  return JSON.parse(r.body||"{}");
}

exports.catalystUsable=catalystUsable;
exports.combine=combine;

exports.handler=async()=>{
  const generatedAt=new Date().toISOString();
  let market={validCount:0,total:3,data:{},errors:[]};
  let catalyst={items:[],summary:{count:0,catalystBias:"NEUTRAL",weightedBias:"NEUTRAL",catalystConfidence:0,catalystRisk:100,catalystHealth:0,catalystFreshness:0}};

  try{market=await invoke(marketModule.handler);}catch(e){market.errors=[String(e?.message||e)];}
  try{catalyst=await invoke(catalystModule.handler);}catch(e){catalyst.error=String(e?.message||e);}

  const c=catalyst.summary||{};
  const results=[];
  for(const [instrument,m] of Object.entries(market.data||{})){
    let aiResult={aiProbability:50,aiDirection:"NEUTRAL",confidence:5,uncertainty:95};
    try{
      aiResult=ai.infer({
        score:m?.score,
        confidence:m?.confidence,
        agreementPct:m?.agreementPct,
        riskScore:m?.riskScore,
        dataHealth:m?.dataHealth,
        catalystConfidence:c.catalystConfidence,
        catalystRisk:c.catalystRisk,
        catalystFreshness:c.catalystFreshness
      });
    }catch{}
    const fusion=combine(m,{
      count:c.count,catalystHealth:c.catalystHealth,catalystConfidence:c.catalystConfidence,
      catalystRisk:c.catalystRisk,catalystFreshness:c.catalystFreshness,
      catalystBias:c.catalystBias,weightedBias:c.weightedBias
    },aiResult);
    results.push({
      instrument,symbol:m?.symbol||null,price:m?.price??null,movePct:m?.movePct??null,
      score:m?.score??null,confidence:m?.confidence??null,bias:m?.bias||"NEUTRAL",
      trend:m?.trend||"UNKNOWN",regime:m?.regime||"UNKNOWN",
      volatility:m?.volatilityState||"UNKNOWN",riskScore:m?.riskScore??null,
      dataHealth:m?.dataHealth??0,freshnessTier:m?.freshnessTier||"UNKNOWN",
      quality:m?.quality??0,decision:fusion.decision,gate:fusion.gate,
      ai:aiResult,source:m?.source||null,ts:m?.ts||null,error:m?.error||null
    });
  }

  const integrated=Number(market.validCount||0)>0 && catalystUsable({
    count:c.count,catalystHealth:c.catalystHealth,
    catalystConfidence:c.catalystConfidence,catalystFreshness:c.catalystFreshness
  });
  const usable=results.filter(r=>r.quality===100);
  const avgConfidence=usable.length?Math.round(usable.reduce((s,r)=>s+Number(r.confidence||0),0)/usable.length):0;
  return {
    status:integrated?"INTEGRATED":"DEGRADED",
    gate:integrated && avgConfidence>=55?"READY":"HOLD",
    version:"V730000-RECOVERY",
    generatedAt,
    market:{validCount:Number(market.validCount||0),total:Number(market.total||3),session:market.marketSession||"UNKNOWN",errors:market.errors||[]},
    catalysts:{count:Number(c.count||0),bias:c.weightedBias||c.catalystBias||"NEUTRAL",confidence:Number(c.catalystConfidence||0),risk:Number(c.catalystRisk??100),health:Number(c.catalystHealth||0),freshness:Number(c.catalystFreshness||0)},
    consensus:{count:usable.length,avgConfidence},
    results,
    guardrails:["market-feed-validation","catalyst-feed-validation","stale-data-gate","risk-gate","confidence-gate","BUY-SELL-WAIT-conservative-resolution"]
  };
};

