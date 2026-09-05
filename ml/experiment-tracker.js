// V20800: append-only experiment result records.
function record(input){return {id:input.id,createdAt:new Date().toISOString(),datasetHash:input.datasetHash,model:input.model,features:input.features,foldConfig:input.foldConfig,metrics:input.metrics,status:input.status||"RESEARCH"}}
function compare(records){return [...records].sort((a,b)=>(b.metrics?.sharpe||-999)-(a.metrics?.sharpe||-999))}
module.exports={record,compare};
