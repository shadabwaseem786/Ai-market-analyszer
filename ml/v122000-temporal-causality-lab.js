// V122000 Temporal Causality & Lead-Lag Lab — research-only.
function windows(){return ["MILLISECONDS","SECONDS","MINUTES","HOURS","SESSION","DAYS","EXPIRY_CYCLE"]}
function analyze(series=[],maxLag=20){
 const out=[]; for(let lag=-maxLag;lag<=maxLag;lag++){if(lag===0)continue; const pairs=[]; for(let i=Math.max(0,lag);i<series.length&&i+lag<series.length;i++){const a=lag>0?series[i].x:series[i+lag].x,b=lag>0?series[i+lag].y:series[i].y;if(Number.isFinite(a)&&Number.isFinite(b))pairs.push([a,b])}
 if(pairs.length>2){const ax=pairs.reduce((s,p)=>s+p[0],0)/pairs.length,by=pairs.reduce((s,p)=>s+p[1],0)/pairs.length;const num=pairs.reduce((s,p)=>s+(p[0]-ax)*(p[1]-by),0),da=Math.sqrt(pairs.reduce((s,p)=>s+(p[0]-ax)**2,0)),db=Math.sqrt(pairs.reduce((s,p)=>s+(p[1]-by)**2,0));out.push({lag,correlation:da&&db?+(num/(da*db)).toFixed(4):0})}}
 return {version:"V122000",observations:series.length,relationships:out,researchOnly:true};
}
module.exports={windows,analyze};