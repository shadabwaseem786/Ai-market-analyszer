// V90400: realistic research cost model.
function net(gross,{brokerage=0,fees=0,slippage=0,impact=0,tax=0}={}){return Number(gross)-brokerage-fees-slippage-impact-tax}module.exports={net};