// V117000 Market Data Intelligence Fabric — normalized research inputs. No trading/execution.
const FEATURES=["index","spot","futures","oi","pcr","iv","ivSkew","greeks","volume","breadth","liquidity","news","macro","sentiment"];
function normalize(source={}){
 const now=Date.now();
 return Object.fromEntries(FEATURES.map(k=>{const x=source[k]||{}; return [k,{value:x.value??null,timestamp:x.timestamp??null,source:x.source??"UNKNOWN",ageMs:x.timestamp?Math.max(0,now-new Date(x.timestamp).getTime()):null}]}));
}
function health(data={}){
 const vals=Object.values(data), present=vals.filter(x=>x.value!==null).length, fresh=vals.filter(x=>x.ageMs===null||x.ageMs<=120000).length;
 return {version:"V117000",coverage:+(present/vals.length*100).toFixed(1),freshness:+(fresh/vals.length*100).toFixed(1),score:+((present/vals.length*.5+fresh/vals.length*.5)*100).toFixed(1),researchOnly:true};
}
module.exports={FEATURES,normalize,health};