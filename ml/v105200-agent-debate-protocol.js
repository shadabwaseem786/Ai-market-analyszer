// V105200 structured agent debate protocol. Research-only.
function debate(agents=[]){
 const rows=agents.filter(x=>Number.isFinite(Number(x.score))); const bull=rows.filter(x=>x.score>=55), bear=rows.filter(x=>x.score<45);
 const neutral=rows.length-bull.length-bear.length; const gap=Math.abs(bull.length-bear.length);
 return {version:"V105200",bullAgents:bull.map(x=>x.agent),bearAgents:bear.map(x=>x.agent),neutralAgents:rows.filter(x=>x.score>=45&&x.score<55).map(x=>x.agent),balance:+(100-gap/Math.max(1,rows.length)*100).toFixed(1),requiresRebuttal:gap>=2};
}
module.exports={debate};