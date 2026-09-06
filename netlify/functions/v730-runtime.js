// V730000 Recovery Runtime — integrated decision-support orchestrator.
// This is the first live integration layer: it calls the repository's real market-data,
// catalyst-feed and AI engine rather than pretending later release skeletons are active.
const market=require("./market-data.js");
const catalyst=require("./catalyst-feed.js");
const ai=require("./ai-engine.js");

function json(status,payload){return{statusCode:status,headers:{"content-type":"application/json","cache-control":"no-store"},body:JSON.stringify(payload)}}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function combine(m,c,a){
 const ms=clamp(Number(m?.score??50),0,100), mc=clamp(Number(m?.confidence??50),0,100), mr=clamp(Number(m?.riskScore??50),0,100), mh=clamp(Number(m?.dataHealth??0),0,100);
 const cb=String(c?.catalystBias||"NEUTRAL"), cc=clamp(Number(c?.catalystConfidence??0),0,100), cr=clamp(Number(c?.catalystRisk??100),0,100), ch=clamp(Number(c?.catalystHealth??0),0,100);
 const ab=String(a?.aiDirection||"NEUTRAL"), ap=clamp(Number(a?.aiProbability??50),0,100), au=clamp(Number(a?.uncertainty??50),0,100), asp=clamp(Number(a?.ensembleSpread??0),0,100);
 const mdir=ms>=70?"BULLISH":ms<=30?"BEARISH":"NEUTRAL";
 const sign=x=>x==="BULLISH"?1:x==="BEARISH"?-1:0;
 const msign=sign(mdir), csign=sign(cb), asign=sign(ab);
 const technical=ms, catalystScore=cc?clamp(50+csign*(cc-50)*0.7,0,100):50, aiScore=ap;
 const directionScore=0.45*technical+0.25*catalystScore+0.30*aiScore;
 const agreement=(msign===csign?25:msign===0||csign===0?10:-15)+(msign===asign?20:msign===0||asign===0?8:-12)+(csign===asign?15:csign===0||asign===0?6:-8);
 const dataQuality=Math.round(0.55*mh+0.25*ch+0.20*(100-au));
 const governancePenalty=Math.round(asp*0.20+au*0.15+(100-dataQuality)*0.20);
 const confidence=clamp(Math.round(0.38*mc+0.18*cc+0.18*Number(a?.confidence??50)+0.18*mh+0.08*(100-au)+agreement*0.22-governancePenalty),0,95);
 const risk=clamp(Math.round(0.50*mr+0.22*cr+0.13*(100-confidence)+0.10*au+0.05*(100-dataQuality)),0,100);
 const counterfactualBreak=msign!==0&&csign!==0&&asign!==0&&msign!==csign&&msign!==asign&&csign!==asign;
 const evProxy=clamp(Math.round(Math.abs(directionScore-50)*1.6*(1-risk/100)*(confidence/100)),0,80);
 const action=mh<35||dataQuality<45||counterfactualBreak||confidence<55||risk>=65||Math.abs(directionScore-50)<12||evProxy<8?"WAIT":directionScore>=65?"BUY":directionScore<=35?"SELL":"WAIT";
 const gate=action==="WAIT"?"HOLD":"PASS";
 return {decision:action,bias:action==="BUY"?"BULLISH":action==="SELL"?"BEARISH":"NEUTRAL",decisionScore:Math.round(directionScore),confidence,riskScore:risk,gate,
  governance:{dataQuality,ensembleUncertainty:au,ensembleSpread:asp,counterfactualBreak,evProxy,policy:"quality+uncertainty+contradiction+EV gates"},
  components:{technical:Math.round(technical),catalyst:Math.round(catalystScore),ai:Math.round(aiScore)},
  inputs:{marketDirection:mdir,catalystBias:cb,aiDirection:ab,dataHealth:mh,catalystHealth:ch},
  explanation:"V730000 runtime applies quality, ensemble-uncertainty, contradiction and expected-value proxy gates to live market/catalyst/AI evidence."};
}
function catalystUsable(s){return Number(s?.catalystHealth||0)>0&&Number(s?.catalystConfidence||0)>0&&Number(s?.count||0)>0&&Number(s?.catalystFreshness||0)>0}
exports.combine=combine;
exports.catalystUsable=catalystUsable;
exports.handler=async(event)=>{
 try{
  const [mr,cr]=await Promise.all([market.handler(event),catalyst.handler(event)]);
  if(mr.statusCode!==200) return json(502,{version:"V730000-RECOVERY",error:"Market-data function failed"});
  const md=JSON.parse(mr.body||"{}"),cs=JSON.parse(cr.body||"{}");
  const markets=md.data||md.markets||md;
  const marketClosed=String(md.marketSession||"").toUpperCase()==="CLOSED";
  if(md.validCount===0 && !marketClosed) return json(503,{version:"V730000-RECOVERY",status:"DEGRADED",gate:"HOLD",error:"No valid market feeds"});
  const marketList=Object.entries(markets).filter(([k,v])=>v&&typeof v==="object"&&Number.isFinite(Number(v.score))).map(([symbol,v])=>({symbol,...v}));
  if(!marketList.length) return json(503,{version:"V730000-RECOVERY",status:"DEGRADED",gate:"HOLD",error:"Market feed contained no usable scored instruments"});
  const csummary=cs.summary||{};
  const catalystHealthy=catalystUsable(csummary);
  if(!catalystHealthy && !marketClosed) return json(503,{version:"V730000-RECOVERY",status:"DEGRADED",gate:"HOLD",error:"Catalyst feed is unavailable or lacks sufficient fresh evidence"});
  if(!catalystHealthy){csummary.catalystBias="NEUTRAL";csummary.catalystConfidence=0;csummary.catalystRisk=100;csummary.catalystHealth=0;csummary.catalystFreshness=0;csummary.count=0;} if(!Number.isFinite(Number(csummary.catalystConfidence))) csummary.catalystConfidence=0; if(!Number.isFinite(Number(csummary.catalystRisk))) csummary.catalystRisk=100; if(!Number.isFinite(Number(csummary.catalystFreshness))) csummary.catalystFreshness=0;
  const results=[];
  for(const m of marketList){
   const ar=ai.infer?ai.infer({score:m.score,confidence:m.confidence,agreementPct:m.agreementPct,riskScore:m.riskScore,dataHealth:m.dataHealth,catalystConfidence:csummary.catalystConfidence,catalystRisk:csummary.catalystRisk,catalystFreshness:csummary.catalystFreshness}):null;
   const decision=combine(m,csummary,ar||{});
   if(marketClosed){decision.decision="WAIT";decision.bias="NEUTRAL";decision.gate="HOLD";decision.governance={...decision.governance,marketClosed:true};}
   results.push({symbol:m.symbol,market:m,ai:ar,decision});
  }
  return json(200,{version:"V730000-RECOVERY",status:"INTEGRATED",marketSession:marketClosed?"CLOSED":(md.marketSession||"UNKNOWN"),generatedAt:new Date().toISOString(),results,catalyst:csummary,source:"market-data + catalyst-feed + ai-engine",notice:marketClosed?"Market closed: showing last validated snapshot; all actions remain HOLD/NO-TRADE until a fresh open-session feed is validated.":"Decision-support only; not a profitability guarantee or order-execution system."});
 }catch(e){return json(500,{version:"V730000-RECOVERY",status:"ERROR",error:e.message})}
};