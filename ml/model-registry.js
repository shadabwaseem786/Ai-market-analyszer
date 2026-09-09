// V18800: model registry with explicit promotion and rollback metadata.
function candidate(id,metrics,config={}){return {id,createdAt:new Date().toISOString(),status:"CANDIDATE",metrics,config}}
function promote(model,reason="passed OOS gates"){return {...model,status:"PRODUCTION_CANDIDATE",promotionReason:reason,promotedAt:new Date().toISOString()}}
function reject(model,reason="failed OOS gates"){return {...model,status:"REJECTED",rejectionReason:reason,rejectedAt:new Date().toISOString()}}
function rank(models){return [...models].sort((a,b)=>(Number(b.metrics?.sharpe)||-999)-(Number(a.metrics?.sharpe)||-999))}
module.exports={candidate,promote,reject,rank};
