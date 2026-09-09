// V21200: strict chronological split planner.
function split(n,{train=.6,validation=.2}={}){const a=Math.floor(n*train),b=Math.floor(n*(train+validation));return {train:[0,a],validation:[a,b],test:[b,n],chronological:true}}
module.exports={split};
