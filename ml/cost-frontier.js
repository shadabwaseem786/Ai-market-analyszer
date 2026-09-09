// V36400: transaction-cost break-even frontier.
function frontier(edge,costs){return costs.map(c=>({cost:c,net:Number(edge)-Number(c),viable:Number(edge)>Number(c)}))}module.exports={frontier};