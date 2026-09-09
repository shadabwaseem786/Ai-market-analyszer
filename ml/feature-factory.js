// V18200: regime-aware feature factory with strict information cutoff.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function safeNum(x,d=0){return Number.isFinite(Number(x))?Number(x):d}
function ret(a,b){return b?safeNum(a)/b-1:0}
function mean(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0}
function sd(a){if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))}
function ema(values,n){if(!values.length)return 0;const k=2/(n+1);let e=values[0];for(let i=1;i<values.length;i++)e=k*values[i]+(1-k)*e;return e}
function makeFeatures(bars,i=0){
 const b=bars[i]||{}, c=safeNum(b.close), start=Math.max(0,i-120), w=bars.slice(start,i+1);
 const cs=w.map(x=>safeNum(x.close)).filter(x=>x>0), rs=cs.slice(1).map((x,j)=>ret(x,cs[j]));
 const r5=ret(c,safeNum(bars[Math.max(0,i-5)]?.close)),r15=ret(c,safeNum(bars[Math.max(0,i-15)]?.close)),r30=ret(c,safeNum(bars[Math.max(0,i-30)]?.close));
 const v20=sd(rs.slice(-20))*Math.sqrt(390),v60=sd(rs)*Math.sqrt(390);
 const e20=ema(cs.slice(-40),20),e50=ema(cs.slice(-80),50);
 const hi=Math.max(...cs,c),lo=Math.min(...cs,c),range=hi>lo?(c-lo)/(hi-lo):.5;
 const vol=safeNum(b.volume),ois=safeNum(b.open_interest),prevVol=w.slice(-20).map(x=>safeNum(x.volume)).filter(x=>x>0);
 const volZ=prevVol.length&&sd(prevVol)?(vol-mean(prevVol))/sd(prevVol):0;
 return {timestamp:b.timestamp,close:c,return5:r5,return15:r15,return30:r30,volatility20:v20,volatility60:v60,ema20Gap:e20?c/e20-1:0,ema50Gap:e50?c/e50-1:0,rangePosition:range,volume:vol,volumeZ:volZ,openInterest:ois,barRange:c?safeNum(b.high)/c-safeNum(b.low)/c:0};
}
function build(rows){return rows.map((_,i)=>makeFeatures(rows,i))}
module.exports={makeFeatures,build,clamp};
