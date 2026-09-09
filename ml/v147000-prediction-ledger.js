// V147000 Immutable Prediction Ledger.
function record(ledger=[],prediction={}){const id=prediction.id||"P-"+Date.now()+"-"+Math.random().toString(36).slice(2,8);return {version:"V147000",ledger:[...ledger,{...prediction,id,timestamp:prediction.timestamp||new Date().toISOString(),outcome:null,status:"OPEN"}],id,researchOnly:true};}
function settle(ledger=[],id,outcome){return {version:"V147000",ledger:ledger.map(x=>x.id===id?{...x,outcome,status:"SETTLED",settledAt:new Date().toISOString()}:x)};}
module.exports={record,settle};