// V18300: multi-horizon labels with cost, slippage and triple barriers.
function labelAt(bars,i,{horizon=30,costBps=8,slippageBps=2,pt=.006,sl=.004}={}){
 const e=Number(bars[i]?.close);if(!Number.isFinite(e))return {label:null};
 const end=Math.min(bars.length-1,i+horizon),cost=((Number(costBps)||0)+(Number(slippageBps)||0))/10000;
 const future=bars.slice(i+1,end+1);let barrier="TIME";
 for(const b of future){if(Number(b.high)>=e*(1+pt+cost)){barrier="TARGET";break}if(Number(b.low)<=e*(1-sl-cost)){barrier="STOP";break}}
 const gross=Number(bars[end]?.close)/e-1,net=gross-2*cost;
 return {label:net>0?"UP":net<0?"DOWN":"FLAT",forwardReturn:net,barrier,horizonBars:end-i,costRate:2*cost};
}
function buildLabels(bars,opts={}){return bars.map((_,i)=>labelAt(bars,i,opts)).filter(x=>x.horizonBars>0)}
function buildMultiHorizon(bars,opts={}){return Object.fromEntries([5,15,30,60].map(h=>[h,buildLabels(bars,{...opts,horizon:h})]))}
module.exports={labelAt,buildLabels,buildMultiHorizon};
