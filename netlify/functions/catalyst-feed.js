const SOURCE_WEIGHT={Reuters:1.00,Bloomberg:1.00,"The Hindu":0.95,CNBC:0.95,"Economic Times":0.90,Moneycontrol:0.85,"BusinessLine":0.85,"NDTV Profit":0.85,"TradingView":0.80,"India Infoline":0.75};
const POS=["surge","gain","rally","rise","rebound","bullish","positive","upgrade","beats","strong","support","inflow","record high","growth","outperform"];
const NEG=["fall","falls","decline","drop","downside","bearish","negative","threat","risk","weak","outflow","selloff","crash","cut","downgrade","under pressure","loss"];
const HIGH=["war","iran","israel","oil","crude","rupee","rbi","rate","inflation","tariff","sanction","election","budget","bank","ceo","default","geopolitical"];
function clean(s){return String(s||"").replace(/<!\[CDATA\[|\]\]>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#39;/g,"'").replace(/&quot;/g,"\"").trim();}
function field(x,k){const z=x.match(new RegExp("<"+k+">([\\s\\S]*?)</"+k+">","i"));return z?clean(z[1]):"";}
function sourceWeight(source){const s=String(source||"");for(const [k,v] of Object.entries(SOURCE_WEIGHT))if(s.toLowerCase().includes(k.toLowerCase()))return v;return 0.65;}
function analyze(item){
 const title=item.title.toLowerCase(),hits=words=>words.filter(w=>title.includes(w)).length,p=hits(POS),n=hits(NEG),h=hits(HIGH);
 const sentiment=p>n?"POSITIVE":n>p?"NEGATIVE":"NEUTRAL",magnitude=Math.min(5,Math.abs(p-n)+h);
 const relevance=Math.min(100,Math.round(35+h*12+(title.includes("nifty")?25:0)+(title.includes("banknifty")||title.includes("bank nifty")?20:0)));
 const impact=Math.min(100,Math.round(35+magnitude*11)),parsed=Date.parse(item.pubDate),ageMin=Number.isFinite(parsed)?Math.max(0,(Date.now()-parsed)/60000):Infinity;
 const recency=Number.isFinite(ageMin)?Math.max(0,Math.round(100*Math.exp(-ageMin/(60*18)))):0,weight=sourceWeight(item.source);
 const catalystScore=Math.round(Math.min(100,0.35*relevance+0.30*impact+0.25*recency+10*weight)),direction=sentiment==="POSITIVE"?"BULLISH":sentiment==="NEGATIVE"?"BEARISH":"NEUTRAL";
 const tags=[h?"MACRO":"",title.includes("bank")?"BANKING":"",title.includes("nifty")?"INDEX":"",title.includes("oil")||title.includes("crude")?"ENERGY":"",title.includes("rbi")?"RBI":"",title.includes("rupee")?"FX":"",title.includes("iran")||title.includes("israel")||title.includes("war")?"GEOPOLITICS":""].filter(Boolean);
 const directionalStrength=Math.min(100,Math.round(Math.abs(p-n)*18+h*8+relevance*0.25));
 const confidence=Math.min(95,Math.max(0,Math.round(35+0.35*relevance+0.25*impact+0.15*recency+8*weight)));
 return {...item,sentiment,direction,relevance,impact,recency,sourceWeight:weight,catalystScore,directionalStrength,confidence,ageMinutes:Number.isFinite(ageMin)?Math.round(ageMin):null,tags:[...new Set(tags)]};
}
exports.handler=async(event)=>{
 const q=encodeURIComponent("NIFTY OR BANKNIFTY OR FINNIFTY OR Indian stock market OR RBI OR crude oil OR rupee OR Iran OR Israel OR tariff"),url="https://news.google.com/rss/search?q="+q+"&hl=en-IN&gl=IN&ceid=IN:en";
 try{
  const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),6500);let r;try{r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (CatalystMonitor/9700)"},signal:ctl.signal});}finally{clearTimeout(timer);}
  if(!r.ok)throw new Error("RSS HTTP "+r.status);
  const xml=await r.text(),raw=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0,30).map(m=>({title:field(m[1],"title"),link:field(m[1],"link"),pubDate:field(m[1],"pubDate"),source:field(m[1],"source")}));
  const items=raw.filter(x=>x.title&&x.pubDate).map(analyze).filter(x=>x.catalystScore>0).sort((a,b)=>b.catalystScore-a.catalystScore);
  const unique=[],seen=new Set();for(const x of items){const key=x.title.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();if(!seen.has(key)){seen.add(key);unique.push(x);}}
  const bullish=unique.filter(x=>x.direction==="BULLISH").length,bearish=unique.filter(x=>x.direction==="BEARISH").length,avg=unique.length?Math.round(unique.reduce((s,x)=>s+x.catalystScore,0)/unique.length):0;
  const directional=unique.reduce((s,x)=>s+(x.direction==="BULLISH"?x.directionalStrength:x.direction==="BEARISH"?-x.directionalStrength:0),0);
  const weightedDirectional=unique.reduce((s,x)=>s+(x.direction==="BULLISH"?1:x.direction==="BEARISH"?-1:0)*x.catalystScore*x.confidence,0);
  const weightedBias=weightedDirectional>15000?"BULLISH":weightedDirectional<-15000?"BEARISH":"NEUTRAL";
  const catalystBreadthScore=unique.length?Math.min(100,Math.round((Math.min(bullish,bearish)+Math.max(bullish,bearish)*0.5)*100/Math.max(1,unique.length))):0;
  const catalystBias=directional>20?"BULLISH":directional<-20?"BEARISH":"NEUTRAL";
  const catalystConfidence=unique.length?Math.min(95,Math.round(unique.reduce((s,x)=>s+x.confidence,0)/unique.length)):0;
  const catalystRisk=Math.max(0,Math.min(100,Math.round((100-catalystConfidence)*0.6+(unique.length<5?25:unique.length<10?10:0)+(catalystBreadthScore<40?25:catalystBreadthScore<60?10:0))));
  const catalystHealth=unique.length>=10&&catalystConfidence>=70?100:unique.length>=5&&catalystConfidence>=55?75:unique.length>=2&&catalystConfidence>=45?50:0;
  const catalystFreshness=unique.length?Math.round(unique.reduce((s,x)=>s+(Number.isFinite(x.ageMinutes)?Math.max(0,100-x.ageMinutes*3):0),0)/unique.length):0;
  return {statusCode:200,headers:{"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":"*"},body:JSON.stringify({version:"V14000",items:unique,summary:{count:unique.length,bullish,bearish,neutral:unique.length-bullish-bearish,avgCatalystScore:avg,catalystBias,catalystConfidence,weightedBias,catalystBreadthScore,catalystRisk,catalystHealth,catalystFreshness}})};
 }catch(e){return {statusCode:200,headers:{"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":"*"},body:JSON.stringify({version:"V14000",items:[],summary:{count:0,bullish:0,bearish:0,neutral:0,avgCatalystScore:0},error:e.message})};}
};