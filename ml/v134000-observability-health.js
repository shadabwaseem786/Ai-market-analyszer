// V134000 Research System Observability — health and data quality.
function health(x={}){
 const checks={marketData:x.marketData===true,optionsData:x.optionsData===true,newsData:x.newsData===true,timestamps:x.timestamps===true,latency:Number(x.latencyMs||999999)<=5000,errors:Number(x.errorRate||100)<=5};
 const passed=Object.values(checks).filter(Boolean).length;
 return {version:"V134000",status:passed===Object.keys(checks).length?"HEALTHY":passed>=4?"DEGRADED":"BLOCKED",checks,score:+(100*passed/Object.keys(checks).length).toFixed(2),automaticTrading:false};
}
module.exports={health};