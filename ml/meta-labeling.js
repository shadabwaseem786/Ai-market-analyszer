// V38100: meta-labeling confidence filter.
function filter(rows,min=.6){return rows.filter(x=>Number(x.confidence)>=min)}module.exports={filter};