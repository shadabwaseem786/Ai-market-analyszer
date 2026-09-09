// V39400: calibration by market regime.
function group(rows){const o={};for(const r of rows||[]){const k=r.regime??"UNKNOWN";(o[k]??=[]).push(r)}return o}module.exports={group};