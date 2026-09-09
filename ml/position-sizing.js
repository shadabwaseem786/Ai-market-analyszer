// V30700: capped research position-sizing contract.
function size({edge=0,risk=1,max=1}={}){if(!(risk>0))return 0;return Math.max(0,Math.min(max,edge/risk))}module.exports={size};