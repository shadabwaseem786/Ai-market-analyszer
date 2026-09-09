// V102300 temporal causal-chain validator. Research-only.
function validate(events=[]){
 const ordered=[...events].sort((a,b)=>new Date(a.time||0)-new Date(b.time||0));
 let violations=0;
 for(let i=1;i<ordered.length;i++) if(new Date(ordered[i].time||0)<new Date(ordered[i-1].time||0)) violations++;
 return {version:"V102300",events:ordered.length,temporalIntegrity:violations===0?"PASS":"FAIL",violations};
}
module.exports={validate};