/*
 V100000 LIVE DATA CONTRACT + FEATURE REGISTRY + AUDIT ORCHESTRATOR
 Provider-agnostic adapters for NSE/NASDAQ/COMMODITY.
 Does not embed credentials or bypass provider licensing.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  const MARKETS={
    NSE:{currency:"INR",timezone:"Asia/Kolkata",features:["price","volume","futures","options","oi","iv","catalyst"]},
    NASDAQ:{currency:"USD",timezone:"America/New_York",features:["price","volume","options","catalyst"]},
    COMMODITY:{currency:"USD",timezone:"Asia/Kolkata",features:["price","volume","futures","options","macro"]}
  };

  function featureRegistry(market="NSE"){
    const m=MARKETS[market]||MARKETS.NSE;
    return m.features.map((name,i)=>({id:`${market}_${name}`,name,required:i<2,enabled:true}));
  }

  function adapterContract(input={}){
    const market=input.market||"NSE";
    return {
      market,instrument:input.instrument||"UNKNOWN",
      timestamp:input.timestamp||new Date().toISOString(),
      provider:input.provider||"UNCONFIGURED",
      fields:input.fields||{},
      status:input.status||"UNVERIFIED",
      licenseChecked:input.licenseChecked===true
    };
  }

  function syncState(input={}){
    const now=Date.now();
    const ts=Date.parse(input.timestamp||"");
    const age=Number.isFinite(ts)?(now-ts)/60000:Infinity;
    const freshness=clamp(100-age/Math.max(n(input.maxAgeMinutes,15))*100,0,100);
    return {state:freshness>=75?"LIVE":freshness>=35?"STALE":"OFFLINE",
      freshness,ageMinutes:age,provider:input.provider||"UNCONFIGURED"};
  }

  function featureCoverage(record={},market="NSE"){
    const req=featureRegistry(market).filter(x=>x.required).map(x=>x.name);
    const present=req.filter(k=>record[k]!==undefined&&record[k]!==null);
    return {required:req,present,coverage:req.length?present.length/req.length*100:100};
  }

  function auditEvent(event={}){
    return {id:event.id||`audit_${Date.now()}`,timestamp:new Date().toISOString(),
      action:event.action||"UNKNOWN",market:event.market||"NSE",
      instrument:event.instrument||"UNKNOWN",module:event.module||"UNKNOWN",
      inputVersion:event.inputVersion||"unknown",decision:event.decision||"NONE",
      reason:event.reason||"",automaticExecution:false};
  }

  function orchestration(input={}){
    const contract=adapterContract(input);
    const sync=syncState(contract);
    const coverage=featureCoverage(input.fields||{},contract.market);
    const usable=sync.state==="LIVE"&&coverage.coverage>=80&&contract.licenseChecked!==false;
    return {contract,sync,coverage,usable,
      gate:usable?"PROCEED":"NO-TRADE",
      audit:auditEvent({action:"DATA_GATE",market:contract.market,
        instrument:contract.instrument,module:"V100000",decision:usable?"PROCEED":"NO-TRADE",
        reason:usable?"fresh_and_covered":"stale_or_incomplete"})};
  }

  global.LiveDataOrchestratorV100000={
    MARKETS,featureRegistry,adapterContract,syncState,featureCoverage,auditEvent,orchestration
  };
})(typeof globalThis!=="undefined"?globalThis:window);
