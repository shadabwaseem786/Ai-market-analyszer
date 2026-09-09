// V107600 champion/challenger leaderboard.
function rank(models=[]){
 const rows=models.map(m=>({...m,score:Number(m.score)||0})).sort((a,b)=>b.score-a.score);
 return {version:"V107600",leaderboard:rows.map((m,i)=>({...m,rank:i+1})),winner:rows[0]?.id||null,automaticPromotion:false};
}
module.exports={rank};