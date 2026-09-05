// V129000 F&O Decision Intelligence Matrix — research-only, no order execution.
const FACTORS=["CATALYST","REGIME","TREND","OPTIONS_CHAIN","OI","IV","GREEKS","FUTURES_BASIS","VOLUME","BREADTH","CROSS_ASSET","FII_DII","TEMPORAL","ANALOGUES","MODEL_COUNCIL","UNCERTAINTY","RED_TEAM"];
function normalize(factors={}){
 const out={}; for(const k of FACTORS){const v=Number(factors[k]);out[k]=Number.isFinite(v)?Math.max(-100,Math.min(100,v)):null} return out;
}
function decide(factors={},thresholds={buy:35,sell:-35,confidence:65}){
 const f=normalize(factors), vals=Object.values(f).filter(v=>v!==null), score=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
 const confidence=vals.length?Math.min(100,Math.abs(score)*.7+vals.length/FACTORS.length*30):0;
 let action="WAIT"; if(confidence>=thresholds.confidence&&score>=thresholds.buy)action="BUY"; else if(confidence>=thresholds.confidence&&score<=thresholds.sell)action="SELL";
 const conflicts=vals.filter(v=>Math.sign(v)!==Math.sign(score)&&Math.abs(v)>=30).length;
 return {version:"V129000",action,score:+score.toFixed(2),confidence:+confidence.toFixed(2),conflicts,coverage:+(100*vals.length/FACTORS.length).toFixed(2),factors:f,researchOnly:true,automaticTrading:false};
}
module.exports={FACTORS,normalize,decide};