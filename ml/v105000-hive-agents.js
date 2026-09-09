// V105000 Research Hive — specialist-agent coordination. Research-only.
const AGENTS=["CATALYST","OPTIONS","MACRO","REGIME","TECHNICAL","BREADTH","LIQUIDITY","NEWS","RISK","ADVERSARIAL"];
function run(observations={}){
 const results=AGENTS.map((name,i)=>{const key=name.toLowerCase(); const v=Number(observations[key]); return {agent:name,score:Number.isFinite(v)?Math.max(0,Math.min(100,v)):50,available:Number.isFinite(v),independent:true}});
 const available=results.filter(x=>x.available), mean=available.length?available.reduce((a,x)=>a+x.score,0)/available.length:50;
 const disagreement=available.length?Math.max(...available.map(x=>x.score))-Math.min(...available.map(x=>x.score)):100;
 return {version:"V105000",agents:results,coverage:+(available.length/AGENTS.length*100).toFixed(1),consensus:+mean.toFixed(1),disagreement:+disagreement.toFixed(1),researchOnly:true};
}
module.exports={AGENTS,run};