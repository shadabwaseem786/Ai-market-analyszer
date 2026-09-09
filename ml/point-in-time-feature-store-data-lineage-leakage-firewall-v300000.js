/*
 V300000 POINT-IN-TIME FEATURE STORE + DATA LINEAGE + LEAKAGE FIREWALL
 Every feature is governed by event/availability timestamps.
 No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const toMs=x=>{const t=Date.parse(x);return Number.isFinite(t)?t:NaN};

 function featureAvailableAt(feature, predictionTime){
   const p=toMs(predictionTime), a=toMs(feature.availableAt||feature.timestamp||feature.eventTime);
   return Number.isFinite(p)&&Number.isFinite(a)&&a<=p;
 }
 function pointInTimeJoin(features=[], predictionTime){
   return features.filter(f=>featureAvailableAt(f,predictionTime))
     .sort((a,b)=>toMs(a.availableAt||a.timestamp||a.eventTime)-toMs(b.availableAt||b.timestamp||b.eventTime))
     .reduce((acc,f)=>{acc[f.name||f.key||String(f.id)]=f.value;return acc;},{});
 }
 function lineage(feature){
   return {id:feature.id||feature.name,source:feature.source||"UNKNOWN",
     eventTime:feature.eventTime||null,availableAt:feature.availableAt||feature.timestamp||null,
     revision:feature.revision||0,transform:feature.transform||"RAW",
     hash:feature.hash||null};
 }
 function leakageAudit(features=[], predictionTime){
   const p=toMs(predictionTime), violations=[];
   features.forEach(f=>{
     const a=toMs(f.availableAt||f.timestamp||f.eventTime);
     if(!Number.isFinite(a)||!Number.isFinite(p)||a>p)
       violations.push({id:f.id||f.name,availableAt:f.availableAt||f.timestamp||f.eventTime,predictionTime});
   });
   return {passed:violations.length===0,violations,count:violations.length,
     status:violations.length?"LEAKAGE_DETECTED":"CLEAN"};
 }
 function revisionAudit(features=[]){
   const futureRevision=features.filter(f=>n(f.revision,0)>0 && f.revisedAt && f.eventTime &&
     toMs(f.revisedAt)>toMs(f.eventTime));
   return {revisedCount:futureRevision.length,items:futureRevision.map(f=>({id:f.id||f.name,revisedAt:f.revisedAt,eventTime:f.eventTime})),
     status:futureRevision.length?"REVISION_RISK":"OK"};
 }
 function freshness(feature,now){
   const a=toMs(feature.availableAt||feature.timestamp||feature.eventTime), t=toMs(now);
   if(!Number.isFinite(a)||!Number.isFinite(t))return {ageMs:null,state:"UNKNOWN"};
   const age=Math.max(0,t-a);
   return {ageMs:age,state:age<=n(feature.maxAgeMs,86400000)?"FRESH":"STALE"};
 }
 function buildTrainingRow(event,features){
   const pt=event.predictionTime||event.eventTime;
   const audit=leakageAudit(features,pt);
   if(!audit.passed) return {ok:false,audit};
   return {ok:true,predictionTime:pt,entity:event.entity,features:pointInTimeJoin(features,pt),
     lineage:features.filter(f=>featureAvailableAt(f,pt)).map(lineage),audit};
 }
 function firewall(dataset=[]){
   const violations=[];
   dataset.forEach(row=>{
     const a=leakageAudit(row.features||[],row.predictionTime);
     if(!a.passed)violations.push({entity:row.entity,predictionTime:row.predictionTime,violations:a.violations});
   });
   return {passed:violations.length===0,violations,count:violations.length,
     status:violations.length?"BLOCKED":"PASSED"};
 }
 global.PointInTimeV300000={featureAvailableAt,pointInTimeJoin,lineage,leakageAudit,revisionAudit,freshness,buildTrainingRow,firewall};
})(typeof globalThis!=="undefined"?globalThis:window);
