// V101100 bounded episodic research memory. No order execution or self-modifying code.
function retrieve(history=[],query={}){
 const regime=String(query.regime||"UNKNOWN").toUpperCase();
 const matches=history.filter(x=>String(x.regime||"").toUpperCase()===regime).slice(-20);
 const n=matches.length, success=n?matches.filter(x=>x.correct===true).length/n:null;
 return {version:"V101100",matches:n,historicalHitRate:success===null?null:+(success*100).toFixed(1),memoryBound:20,autoPromotion:false};
}
module.exports={retrieve};