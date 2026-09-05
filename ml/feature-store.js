// V21100: versioned feature-store contract.
function key(symbol,timestamp,version="v1"){return [symbol,timestamp,version].join("|")}
function validate(features){return features&&features.timestamp&&Number.isFinite(features.close)}
module.exports={key,validate};
