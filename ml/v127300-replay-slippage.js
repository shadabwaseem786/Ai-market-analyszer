// V127300 research execution-friction simulator; no real execution.
function simulate(trades=[],costs={slippageBps:5,feeBps:2}){
 const bps=(Number(costs.slippageBps)||0)+(Number(costs.feeBps)||0);
 return {version:"V127300",assumedCostsBps:bps,results:trades.map(t=>({...t,netReturn:+(Number(t.grossReturn||0)-bps/10000).toFixed(6)})),liveExecution:false};
}
module.exports={simulate};