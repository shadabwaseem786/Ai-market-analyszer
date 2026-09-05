// V366000 regime-specific simulation.
function run(regimes=[],simulator){return regimes.map(r=>({regime:r.name,result:typeof simulator==="function"?simulator(r):null}));} module.exports={run};