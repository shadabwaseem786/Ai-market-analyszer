// V351000 Meta-labeling research layer.
function label(predictions=[]){return predictions.map(p=>({...p,metaLabel:Number(p.outcomeScore||0)>0?"VALID":"INVALID"}));} module.exports={label};