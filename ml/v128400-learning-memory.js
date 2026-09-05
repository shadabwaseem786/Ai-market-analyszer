// V128400 validated learning memory.
function append(memory=[],item={}){
 const record={timestamp:item.timestamp||new Date().toISOString(),regime:item.regime||"UNKNOWN",model:item.model||"ENSEMBLE",error:Number(item.error)||0,validated:item.validated===true};
 return {version:"V128400",memory:[...memory,record].slice(-10000),accepted:record.validated};
}
module.exports={append};