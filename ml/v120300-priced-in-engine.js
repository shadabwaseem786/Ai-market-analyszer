// V120300 priced-in assessment.
function assess(x={}){
 const reaction=Math.abs(Number(x.marketReaction)||0),expected=Math.abs(Number(x.expectedReaction)||1),ratio=Math.min(2,reaction/expected);
 const pricedIn=ratio>=1.25?85:ratio>=.8?60:30;
 return {version:"V120300",reactionRatio:+ratio.toFixed(2),pricedInScore:pricedIn,state:pricedIn>=80?"HEAVILY_PRICED":pricedIn>=55?"PARTIALLY_PRICED":"UNDERPRICED"};
}
module.exports={assess};