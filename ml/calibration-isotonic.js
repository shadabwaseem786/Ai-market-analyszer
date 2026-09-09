// V39300: monotonic probability calibration contract.
function calibrate(rows){return rows.filter(x=>Number.isFinite(x.p)&&Number.isFinite(x.y)).sort((a,b)=>a.p-b.p)}module.exports={calibrate};