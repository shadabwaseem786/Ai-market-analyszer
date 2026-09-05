// V20000: multi-model OOS tournament contract and aggregation.
function summarize(models){
 return models.map(m=>({id:m.id,folds:m.folds||0,accuracy:Number(m.accuracy)||0,sharpe:Number(m.sharpe)||0,maxDrawdown:Number(m.maxDrawdown)||0,oosReturn:Number(m.oosReturn)||0,score:(Number(m.accuracy)||0)*100+(Number(m.sharpe)||0)*5-(Number(m.maxDrawdown)||0)*100}))
 .sort((a,b)=>b.score-a.score);
}
function select(results){return summarize(results).find(x=>x.folds>0)||null}
module.exports={summarize,select};
