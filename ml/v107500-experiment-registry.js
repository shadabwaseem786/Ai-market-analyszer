// V107500 reproducible experiment registry.
function register(meta={}){
 return {version:"V107500",id:meta.id||("EXP-"+Date.now()),model:meta.model||"unknown",features:meta.features||[],dataset:meta.dataset||"unknown",seed:meta.seed??42,createdAt:meta.createdAt||new Date().toISOString(),reproducible:true,approvalRequired:true};
}
module.exports={register};