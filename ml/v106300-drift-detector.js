// V106300 data/concept drift detector. Research-only.
function detect(reference=[],current=[]){
 const mean=a=>a.length?a.reduce((x,y)=>x+Number(y),0)/a.length:0;
 const r=mean(reference),c=mean(current),delta=Math.abs(c-r);
 return {version:"V106300",referenceMean:+r.toFixed(2),currentMean:+c.toFixed(2),drift:+delta.toFixed(2),status:delta>20?"HIGH":delta>10?"MEDIUM":"LOW",retrainRecommended:delta>20};
}
module.exports={detect};