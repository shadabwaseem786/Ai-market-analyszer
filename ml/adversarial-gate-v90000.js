export function adversarialGate(prediction, tests={}){
  const failures=Object.entries(tests).filter(([,v])=>v===false).map(([k])=>k);
  const blocked=failures.length>=2 || prediction?.disagreement>28;
  return {approved:!blocked, failures, status:blocked?'BLOCK':'PASS'};
}
