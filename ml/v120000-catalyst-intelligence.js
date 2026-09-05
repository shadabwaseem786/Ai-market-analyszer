// V120000 Catalyst Intelligence — event impact reasoning, research-only.
const TYPES=["EARNINGS","CORPORATE_ACTION","MACRO","POLICY","GEOPOLITICAL","COMMODITY","FLOW","REGULATORY","ANALYST","UNEXPECTED"];
function score(e={}){
 const surprise=Math.max(0,Math.min(100,Number(e.surprise)||0)),materiality=Math.max(0,Math.min(100,Number(e.materiality)||0)),pricedIn=Math.max(0,Math.min(100,Number(e.pricedIn)||0)),breadth=Math.max(0,Math.min(100,Number(e.breadth)||0));
 const impact=surprise*.35+materiality*.35+(100-pricedIn)*.2+breadth*.1;
 return {version:"V120000",type:e.type||"UNEXPECTED",impact:+impact.toFixed(2),surprise,materiality,pricedIn,breadth,researchOnly:true};
}
module.exports={TYPES,score};