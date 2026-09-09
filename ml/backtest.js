// V18000 leakage-aware research backtest primitives.
// This module intentionally contains no broker/order execution.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function netReturn(gross, costs={}) {
  const c=(Number(costs.brokerage)||0)+(Number(costs.stt)||0)+(Number(costs.exchange)||0)+(Number(costs.sebi)||0)+(Number(costs.gst)||0)+(Number(costs.stamp)||0)+(Number(costs.slippage)||0);
  return Number(gross||0)-c;
}
function tripleBarrier(entry, futureBars, pt=0.006, sl=0.004) {
  const e=Number(entry); if(!e||!Array.isArray(futureBars)) return {label:"UNRESOLVED"};
  for(const b of futureBars){
    const hi=Number(b.high),lo=Number(b.low);
    if(hi>=e*(1+pt)) return {label:"TARGET",price:e*(1+pt)};
    if(lo<=e*(1-sl)) return {label:"STOP",price:e*(1-sl)};
  }
  const last=futureBars[futureBars.length-1]; const close=Number(last&&last.close);
  return {label:Number.isFinite(close)?(close>e?"UP":close<e?"DOWN":"FLAT"):"UNRESOLVED",price:close};
}
function purgedWalkForward(rows,{trainSize=10000,testSize=1000,horizonBars=30,embargoBars=30,step=testSize}={}) {
  const out=[]; let testStart=trainSize;
  while(testStart<rows.length){
    const testEnd=Math.min(rows.length,testStart+testSize);
    const trainEnd=Math.max(0,testStart-horizonBars-embargoBars);
    const trainStart=Math.max(0,trainEnd-trainSize);
    if(trainEnd>trainStart&&testEnd>testStart) out.push({train:[trainStart,trainEnd],test:[testStart,testEnd],purge:horizonBars,embargo:embargoBars});
    testStart+=step;
  }
  return out;
}
function metrics(trades){
  const r=trades.map(t=>Number(t.netReturn)||0), n=r.length;
  if(!n) return {samples:0,hitRate:0,meanReturn:0,sharpe:0,maxDrawdown:0,totalReturn:0};
  let equity=1,peak=1,maxDD=0,wins=0;
  for(const x of r){equity*=1+x;peak=Math.max(peak,equity);maxDD=Math.max(maxDD,(peak-equity)/peak);if(x>0)wins++;}
  const mean=r.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(r.reduce((a,b)=>a+(b-mean)**2,0)/Math.max(1,n-1));
  return {samples:n,hitRate:wins/n,meanReturn:mean,sharpe:sd?mean/sd*Math.sqrt(252*6.25):0,maxDrawdown:maxDD,totalReturn:equity-1};
}
module.exports={clamp,netReturn,tripleBarrier,purgedWalkForward,metrics};
