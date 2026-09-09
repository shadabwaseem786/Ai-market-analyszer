// V130000 portfolio conflict gate — avoids treating correlated signals as independent evidence.
function correlationPenalty(groups=[]){
 const n=groups.length; if(!n)return 0;
 const duplicate=n-new Set(groups).size;
 return Math.min(1,duplicate/Math.max(1,n-1));
}
module.exports={correlationPenalty};
