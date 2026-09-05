// V36600: expiry-session regime labeling contract.
function label({daysToExpiry=99,isExpiry=false}={}){return isExpiry?"EXPIRY":daysToExpiry<=1?"PRE_EXPIRY":"NORMAL"}module.exports={label};