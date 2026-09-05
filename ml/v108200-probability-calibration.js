// V108200 probability calibration monitor.
function calibrate(bins=[]){
 const rows=bins.filter(x=>Number.isFinite(Number(x.predicted))&&Number.isFinite(Number(x.actual))).map(x=>({...x,predicted:Number(x.predicted),actual:Number(x.actual)}));
 const ece=rows.length?rows.reduce((s,x)=>s+Math.abs(x.predicted-x.actual),0)/rows.length:100;
 return {version:"V108200",samples:rows.length,ece:+ece.toFixed(3),status:ece<=5?"EXCELLENT":ece<=10?"GOOD":ece<=20?"WATCH":"POOR"};
}
module.exports={calibrate};