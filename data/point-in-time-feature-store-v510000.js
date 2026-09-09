/*
 V510000 POINT-IN-TIME FEATURE STORE CONTRACT
 Prevents look-ahead leakage by requiring observation time and feature availability time.
*/
(function(global){
 function feature(name,value,observedAt,availableAt,source){return {name,value,observedAt,availableAt,source:source||"UNKNOWN"}}
 function isPointInTimeSafe(f,decisionTime){return !!f && new Date(f.availableAt).getTime()<=new Date(decisionTime).getTime()}
 function filterSafe(features,decisionTime){return (features||[]).filter(f=>isPointInTimeSafe(f,decisionTime))}
 function snapshot(features,decisionTime){return {decisionTime,features:filterSafe(features,decisionTime)}}
 global.PointInTimeStoreV510000={feature,isPointInTimeSafe,filterSafe,snapshot};
})(typeof globalThis!=="undefined"?globalThis:window);
