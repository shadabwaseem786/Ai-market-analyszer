// V18600: dataset normalization and quality gate.
function normalizeRow(r){
 const ts=Date.parse(r.timestamp||r.time||r.datetime); return {timestamp:Number.isFinite(ts)?new Date(ts).toISOString():null,open:Number(r.open),high:Number(r.high),low:Number(r.low),close:Number(r.close),volume:Number(r.volume)||0,open_interest:Number(r.open_interest??r.oi)||0,symbol:String(r.symbol||"").toUpperCase(),expiry:r.expiry||null,strike:Number(r.strike)||null,right:r.right||null};
}
function qualityReport(rows){
 const a=rows.map(normalizeRow), sorted=a.filter(x=>x.timestamp).sort((x,y)=>Date.parse(x.timestamp)-Date.parse(y.timestamp)), seen=new Set(),dup=0,bad=0,gaps=0;
 let prev=null; for(const r of sorted){if(seen.has(r.timestamp))dup++;seen.add(r.timestamp);if(!(r.high>=Math.max(r.open,r.close)&&r.low<=Math.min(r.open,r.close)&&r.high>=r.low))bad++;if(prev){const d=(Date.parse(r.timestamp)-Date.parse(prev))/60000;if(d>5&&d<1440)gaps++}prev=r.timestamp}
 const coverage=sorted.length?1-bad/sorted.length:0;
 return {rows:sorted.length,duplicates:dup,invalidOHLC:bad,gaps,coverage,ready:sorted.length>0&&dup===0&&coverage>=.99};
}
module.exports={normalizeRow,qualityReport};
