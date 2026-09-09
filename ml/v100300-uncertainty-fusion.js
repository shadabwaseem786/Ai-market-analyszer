// V100300 uncertainty + evidence fusion.
function fuse(a={},b={},c={}){
 const u=[Number(a.uncertainty)||100,100-(Number(b.causalConfidence)||0),Math.max(0,100-(Number(c.robustness)||0))];
 const uncertainty=Math.min(100,u.reduce((x,y)=>x+y,0)/u.length);
 const confidence=Math.max(0,100-uncertainty);
 return {version:"V100300",uncertainty:+uncertainty.toFixed(1),confidence:+confidence.toFixed(1),status:uncertainty>60?"HIGH":uncertainty>35?"MEDIUM":"LOW"};
}
module.exports={fuse};