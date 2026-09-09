// V40500: cost-sensitive decision threshold.
function threshold({fpCost=1,fnCost=1}={}){return Number(fnCost)/(Number(fpCost)+Number(fnCost))}module.exports={threshold};