// V145000 Catalyst Intelligence Ranking.
function rank(items=[]){return items.map(x=>{const score=.3*Number(x.impact||0)+.25*Number(x.novelty||0)+.2*Number(x.credibility||0)+.25*Number(x.transmission||0);return {...x,score:+score.toFixed(2)}}).sort((a,b)=>b.score-a.score);}
module.exports={rank};