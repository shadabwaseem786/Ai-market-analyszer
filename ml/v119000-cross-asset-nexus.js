// V119000 Cross-Asset Intelligence Nexus — research-only.
const ASSETS=["NIFTY","BANKNIFTY","FINNIFTY","SECTOR","INDIA_VIX","USDINR","CRUDE","GOLD","US_INDICES","BOND_YIELDS","ASIA","GLOBAL_VOL","FII_FLOW","DII_FLOW"];
function normalize(records=[]){return records.map((r,i)=>({id:r.id||ASSETS[i]||"ASSET_"+i,value:Number(r.value)||0,change:Number(r.change)||0,timestamp:r.timestamp||null,source:r.source||"UNKNOWN"}))}
function matrix(records=[]){const ids=records.map(r=>r.id); return {version:"V119000",assets:ids,relationships:ids.map(a=>({asset:a,links:records.filter(r=>r.id!==a).map(r=>({to:r.id,leadLag:Number(r.leadLag)||0,correlation:Number(r.correlation)||0}))})),researchOnly:true}}
module.exports={ASSETS,normalize,matrix};