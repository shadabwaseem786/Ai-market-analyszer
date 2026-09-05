// V22000: immutable-style dataset lineage record.
function record({source,sourceVersion,downloadedAt,timezone,symbols,interval,hash}){return {lineageVersion:"V22000",source,sourceVersion,downloadedAt,timezone,symbols,interval,hash,createdAt:new Date().toISOString()}}
module.exports={record};
