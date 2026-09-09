/*
 V480000 POINT-IN-TIME DATA INTEGRITY + FEATURE STORE
 Prevents future leakage, stale/missing inputs, duplicate timestamps and
 invalid feature provenance before data reaches the prediction stack.
 Research/inference only.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function validateRow(row={},opts={}){
    const ts=new Date(row.timestamp||0).getTime();
    const asOf=new Date(opts.asOf||Date.now()).getTime();
    const maxAgeMs=n(opts.maxAgeMinutes,30)*60000;
    const issues=[];
    if(!Number.isFinite(ts)||ts<=0) issues.push("INVALID_TIMESTAMP");
    if(Number.isFinite(ts)&&ts>asOf) issues.push("FUTURE_DATA");
    if(Number.isFinite(ts)&&asOf-ts>maxAgeMs) issues.push("STALE_DATA");
    if(row.value===null||row.value===undefined||Number.isNaN(Number(row.value))) issues.push("MISSING_VALUE");
    if(row.sourceQuality!==undefined && n(row.sourceQuality,0)<50) issues.push("LOW_SOURCE_QUALITY");
    return {valid:issues.length===0,issues,ageMinutes:Number.isFinite(ts)?Math.max(0,(asOf-ts)/60000):null};
  }

  function detectDuplicates(rows=[]){
    const seen=new Set(), dup=[];
    rows.forEach((r,i)=>{
      const key=[r.instrument,r.timestamp,r.feature||r.name].join("|");
      if(seen.has(key)) dup.push({index:i,key}); else seen.add(key);
    });
    return dup;
  }

  function leakageScan(rows=[],asOf){
    const t=new Date(asOf||Date.now()).getTime();
    return rows.map((r,i)=>{
      const ts=new Date(r.timestamp||0).getTime();
      return {index:i,leakage:!Number.isFinite(ts)||ts>t,
        timestamp:r.timestamp||null};
    }).filter(x=>x.leakage);
  }

  function featureTrust(rows=[],opts={}){
    if(!rows.length)return {score:0,status:"NO_DATA",validRows:0,totalRows:0};
    const checks=rows.map(r=>validateRow(r,opts));
    const valid=checks.filter(x=>x.valid).length;
    const stale=checks.filter(x=>x.issues.includes("STALE_DATA")).length;
    const future=checks.filter(x=>x.issues.includes("FUTURE_DATA")).length;
    const missing=checks.filter(x=>x.issues.includes("MISSING_VALUE")).length;
    const duplicate=detectDuplicates(rows).length;
    const score=clamp(100*(valid/rows.length)-
      Math.min(30,duplicate/Math.max(1,rows.length)*100)-
      Math.min(50,future/Math.max(1,rows.length)*100)-
      Math.min(20,stale/Math.max(1,rows.length)*100)-
      Math.min(20,missing/Math.max(1,rows.length)*100),0,100);
    return {
      score,
      status:score>=90?"TRUSTED":score>=75?"DEGRADED":score>=50?"WARNING":"BLOCKED",
      validRows:valid,totalRows:rows.length,stale,future,missing,duplicate
    };
  }

  function pointInTimeSnapshot(rows=[],asOf){
    const t=new Date(asOf||Date.now()).getTime();
    const latest={};
    rows.filter(r=>{
      const ts=new Date(r.timestamp||0).getTime();
      return Number.isFinite(ts)&&ts<=t;
    }).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp))
      .forEach(r=>{ latest[r.instrument+"|"+(r.feature||r.name)] = r; });
    return Object.values(latest);
  }

  function gate(rows=[],opts={}){
    const trust=featureTrust(rows,opts);
    const leakage=leakageScan(rows,opts.asOf);
    const blocked=trust.status==="BLOCKED"||leakage.length>0;
    return {allowed:!blocked,trustScore:trust.score,status:blocked?"BLOCKED":trust.status,
      leakageCount:leakage.length,diagnostics:trust};
  }

  global.PointInTimeDataEngineV480000={
    validateRow,detectDuplicates,leakageScan,featureTrust,pointInTimeSnapshot,gate
  };
})(typeof globalThis!=="undefined"?globalThis:window);
