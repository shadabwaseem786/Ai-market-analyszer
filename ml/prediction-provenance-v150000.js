// V150000 Prediction Provenance Graph. Creates an auditable explanation for every decision.
export function provenanceV150({instrument,decision,factors={},gates={},dataQuality=0,modelVersion='V150000'}){
  const evidence=Object.entries(factors).map(([name,value])=>({name,value:Number(value)||0}));
  const positives=evidence.filter(x=>x.value>0).sort((a,b)=>b.value-a.value).slice(0,5);
  const negatives=evidence.filter(x=>x.value<0).sort((a,b)=>a.value-b.value).slice(0,5);
  return {modelVersion,instrument,decision,dataQuality,topPositive:positives,topNegative:negatives,gates,createdAt:new Date().toISOString(),auditId:`${modelVersion}-${instrument}-${Date.now()}`};
}
