// V60500: rolling calibration monitor.
function brier(rows=[]){if(!rows.length)return null;return rows.reduce((s,r)=>s+(Number(r.p)-Number(r.y))**2,0)/rows.length}module.exports={brier};