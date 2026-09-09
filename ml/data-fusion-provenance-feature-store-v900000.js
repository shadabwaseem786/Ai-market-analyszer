/*
 V900000 DATA FUSION + PROVENANCE + FEATURE STORE
 Timestamped data contracts, freshness, completeness, anomaly checks,
 provenance, snapshot consistency and feature snapshots.
 Research/inference only. No automatic order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function validateRecord(r={}, now=Date.now()){
    const ts=Date.parse(r.timestamp||"");
    const age=Number.isFinite(ts)?Math.max(0,(now-ts)/60000):Infinity;
    const fields=r.requiredFields||[];
    const missing=fields.filter(k=>r[k]===undefined||r[k]===null||r[k]==="");
    const completeness=fields.length?100*(1-missing.length/fields.length):100;
    const maxAge=n(r.maxAgeMinutes,15);
    const freshness=age===Infinity?0:clamp(100-(age/maxAge)*100,0,100);
    const stale=age>maxAge;
    return {valid:!stale&&missing.length===0,ageMinutes:age,stale,
      completeness, freshness, missing};
  }

  function provenance(source={}, record={}){
    return {
      source:source.name||"UNKNOWN",
      provider:source.provider||"UNKNOWN",
      endpoint:source.endpoint||null,
      timestamp:record.timestamp||null,
      receivedAt:record.receivedAt||new Date().toISOString(),
      revision:record.revision||1,
      checksum:record.checksum||null
    };
  }

  function anomalyScore(values=[]){
    const a=values.map(Number).filter(Number.isFinite);
    if(a.length<4)return {score:0,flag:"INSUFFICIENT_DATA"};
    const mean=a.reduce((s,x)=>s+x,0)/a.length;
    const variance=a.reduce((s,x)=>s+(x-mean)**2,0)/a.length;
    const sd=Math.sqrt(variance)||1;
    const z=Math.max(...a.map(x=>Math.abs((x-mean)/sd)));
    return {score:clamp((z-1)*25,0,100),maxZ:z,
      flag:z>=5?"EXTREME":z>=3?"HIGH":z>=2?"MEDIUM":"NORMAL"};
  }

  function snapshotConsistency(snapshots=[]){
    if(!snapshots.length)return {consistent:false,reason:"NO_SNAPSHOTS"};
    const times=snapshots.map(x=>Date.parse(x.timestamp||"")).filter(Number.isFinite);
    if(!times.length)return {consistent:false,reason:"MISSING_TIMESTAMPS"};
    const spread=(Math.max(...times)-Math.min(...times))/1000;
    const maxSpread=Math.max(...snapshots.map(x=>n(x.maxSpreadSeconds,30)));
    return {consistent:spread<=maxSpread,spreadSeconds:spread,maxSpreadSeconds:maxSpread};
  }

  function featureSnapshot(input={}){
    const validation=validateRecord(input.record||{},input.now||Date.now());
    const consistency=snapshotConsistency(input.snapshots||[]);
    const anomaly=anomalyScore(input.values||[]);
    const usable=validation.valid&&consistency.consistent&&
      anomaly.flag!=="EXTREME"&&input.dataBlocked!==true;
    return {
      id:input.id||String(Date.now()),
      instrument:input.instrument||"UNKNOWN",
      market:input.market||"NSE",
      validation,consistency,anomaly,
      provenance:provenance(input.source||{},input.record||{}),
      usable
    };
  }

  function qualityScore(x={}){
    return clamp(.35*n(x.freshness,0)+.30*n(x.completeness,0)+
      .20*n(x.consistency,0)+.15*(100-n(x.anomaly,0)),0,100);
  }

  function dataGate(x={}){
    const score=qualityScore(x);
    return {score,pass:score>=75&&x.dataBlocked!==true,
      decision:score>=75?"PASS":"NO-TRADE"};
  }

  global.DataFusionV900000={
    validateRecord,provenance,anomalyScore,snapshotConsistency,
    featureSnapshot,qualityScore,dataGate
  };
})(typeof globalThis!=="undefined"?globalThis:window);
