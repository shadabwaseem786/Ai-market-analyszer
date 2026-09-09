// V113000 Neural World Model — unified latent market-state representation. Research-only.
function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,Number(x)||0))}
const DIMENSIONS=["price","volatility","liquidity","options","breadth","macro","catalyst","sentiment","regime","crossAsset"];
function encode(input={}){
 const state=Object.fromEntries(DIMENSIONS.map(k=>[k,clamp(input[k]??50)]));
 const latent=DIMENSIONS.map(k=>+(state[k]/100).toFixed(4));
 return {version:"V113000",dimensions:DIMENSIONS,state,latent,latentSpace:"NORMALIZED_MARKET_STATE",researchOnly:true};
}
function transition(current={},shock={}){
 const next={}; for(const k of DIMENSIONS)next[k]=+clamp((Number(current[k]??50)+(Number(shock[k])||0))).toFixed(2);
 return {version:"V113000",nextState:next,transitionModel:"SCENARIO_DYNAMICS",executionDisabled:true};
}
module.exports={DIMENSIONS,encode,transition};