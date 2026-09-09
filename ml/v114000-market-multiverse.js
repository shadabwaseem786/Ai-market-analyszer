// V114000 Market Multiverse — competing future scenario generator. Research-only.
const SCENARIOS=["BASE","BULL","BEAR","VOLATILITY_SHOCK","LIQUIDITY_CRISIS","CATALYST_FAILURE","SURPRISE_CATALYST","CORRELATION_BREAK"];
function generate(input={}){
 const p=Number(input.baseProbability)||50, u=Number(input.uncertainty)||30;
 const raw=SCENARIOS.map((id,i)=>({id,weight:Math.max(1,(i===0?40:12)+(i===1?p*.15:i===2?(100-p)*.15:u*.08)),drivers:input.drivers?.[id]||[],invalidators:input.invalidators?.[id]||[]}));
 const total=raw.reduce((s,x)=>s+x.weight,0);
 return {version:"V114000",scenarios:raw.map(x=>({...x,probability:+(x.weight/total*100).toFixed(2)})),normalized:true,researchOnly:true};
}
module.exports={SCENARIOS,generate};