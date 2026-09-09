// V42200: multiple-hypothesis test registry.
function register(tests){return(tests||[]).map((x,i)=>({...x,index:i,adjustment:"FDR_REQUIRED"}))}module.exports={register};