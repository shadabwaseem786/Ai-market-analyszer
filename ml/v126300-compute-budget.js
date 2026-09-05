// V126300 adaptive compute allocation.
function allocate(priority="NORMAL",agents=[]){
 const multiplier=priority==="MAX"?3:priority==="ELEVATED"?2:1;
 return {version:"V126300",priority,allocations:agents.map(a=>({agent:a,budgetMultiplier:multiplier})),totalBudgetUnits:agents.length*multiplier};
}
module.exports={allocate};