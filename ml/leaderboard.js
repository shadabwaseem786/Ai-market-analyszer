// V19500: OOS-first model leaderboard.
function rank(results){
 return [...results].filter(x=>x&&Number.isFinite(x.accuracy)&&Number.isFinite(x.maxDrawdown))
  .map(x=>({...x,score:(x.accuracy*100)+(Number(x.sharpe)||0)*5-(x.maxDrawdown*100)}))
  .sort((a,b)=>b.score-a.score);
}
function best(results){return rank(results)[0]||null}
module.exports={rank,best};
