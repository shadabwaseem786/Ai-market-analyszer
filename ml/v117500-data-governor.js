// V117500 data-quality governor.
function govern(x={}){
 const gates={coverage:Number(x.coverage)>=80,freshness:Number(x.freshness)>=80,conflicts:Number(x.conflicts||0)===0,missing:Number(x.missing||0)<=2,skew:Number(x.skewMs||0)<=60000};
 return {version:"V117500",state:Object.values(gates).every(Boolean)?"DATA_VALID":"DATA_BLOCKED",gates,executionDisabled:true,automaticTrading:false};
}
module.exports={govern};