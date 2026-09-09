const marketModule = require('./market-data.js');
const catalystModule = require('./catalyst-feed.js');

function parseBody(result){
  try { return JSON.parse(result?.body || '{}'); } catch { return {}; }
}

function clamp(v,min=0,max=100){
  const n=Number(v);
  return Number.isFinite(n) ? Math.max(min,Math.min(max,n)) : null;
}

function decisionFor(market,catalyst){
  if(!market || market.quality!==100) return "WAIT";
  const score=Number(market.score);
  const confidence=Number(market.confidence);
  const risk=Number(market.riskScore);
  const catalystBias=String(catalyst?.summary?.weightedBias || catalyst?.summary?.catalystBias || "NEUTRAL");
  const catalystStrength=Number(catalyst?.summary?.catalystConfidence || 0);

  if(!Number.isFinite(score) || !Number.isFinite(confidence)) return "WAIT";
  if(confidence<55 || risk>=70 || String(market.freshnessTier)==="STALE") return "WAIT";

  let bias=score>=70 ? "BUY" : score<=30 ? "SELL" : "WAIT";
  if(catalystStrength>=60){
    if(catalystBias==="BULLISH" && bias==="SELL") bias="WAIT";
    if(catalystBias==="BEARISH" && bias==="BUY") bias="WAIT";
  }
  return bias;
}

exports.handler = async () => {
  const startedAt = new Date().toISOString();
  let market = {}, catalyst = {};

  try {
    market = parseBody(await marketModule.handler({httpMethod:"GET",headers:{},body:null}));
  } catch (e) {
    market = {validCount:0,total:0,errors:[String(e?.message || e)]};
  }

  try {
    catalyst = parseBody(await catalystModule.handler({httpMethod:"GET",headers:{},body:null}));
  } catch (e) {
    catalyst = {items:[],summary:{count:0},error:String(e?.message || e)};
  }

  const rows = Object.entries(market.data || {}).map(([name,m]) => ({
    instrument:name,
    symbol:m?.symbol || null,
    price:m?.price ?? null,
    movePct:m?.movePct ?? null,
    score:m?.score ?? null,
    confidence:m?.confidence ?? null,
    bias:m?.bias || "NEUTRAL",
    trend:m?.trend || "UNKNOWN",
    regime:m?.regime || "UNKNOWN",
    volatility:m?.volatilityState || "UNKNOWN",
    riskScore:m?.riskScore ?? null,
    dataHealth:m?.dataHealth ?? 0,
    freshnessTier:m?.freshnessTier || "UNKNOWN",
    quality:m?.quality ?? 0,
    decision:decisionFor(m,catalyst),
    source:m?.source || null,
    ts:m?.ts || null,
    error:m?.error || null
  }));

  const validCount = Number(market.validCount || 0);
  const catalystCount = Number(catalyst.summary?.count || 0);
  const integrated = validCount>0 && catalystCount>0;

  const consensus = rows.filter(r=>r.quality===100 && Number.isFinite(Number(r.score)));
  const avgScore = consensus.length
    ? Math.round(consensus.reduce((s,r)=>s+Number(r.score),0)/consensus.length)
    : null;
  const avgConfidence = consensus.length
    ? Math.round(consensus.reduce((s,r)=>s+Number(r.confidence||0),0)/consensus.length)
    : null;

  const status = integrated ? "INTEGRATED" : "DEGRADED";
  const gate = integrated && (avgConfidence??0)>=55 ? "READY" : "HOLD";

  return {
    statusCode:200,
    headers:{
      "content-type":"application/json",
      "cache-control":"no-store",
      "access-control-allow-origin":"*"
    },
    body:JSON.stringify({
      version:"V730000-RECOVERY",
      status,
      gate,
      generatedAt:startedAt,
      market:{
        validCount,
        total:Number(market.total || rows.length),
        session:market.marketSession || "UNKNOWN",
        errors:market.errors || []
      },
      catalysts:{
        count:catalystCount,
        bias:catalyst.summary?.weightedBias || catalyst.summary?.catalystBias || "NEUTRAL",
        confidence:catalyst.summary?.catalystConfidence ?? 0,
        risk:catalyst.summary?.catalystRisk ?? null,
        freshness:catalyst.summary?.catalystFreshness ?? 0
      },
      consensus:{avgScore,avgConfidence,count:consensus.length},
      results:rows,
      guardrails:[
        "market-feed-validation",
        "catalyst-feed-validation",
        "stale-data-gate",
        "risk-gate",
        "confidence-gate",
        "BUY-SELL-WAIT-conservative-resolution"
      ]
    })
  };
};
