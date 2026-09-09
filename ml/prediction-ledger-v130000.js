// V130000 Prediction Ledger schema. Store predictions, realized outcomes and model errors externally.
const schema={id:'string',symbol:'string',timestamp:'ISO-8601',horizon:'string',action:'BUY|SELL|WAIT',probability:'number',uncertainty:'number',modelVersion:'string',featuresHash:'string',outcome:'pending|win|loss|flat',pnlR:'number|null'};
module.exports={schema};
