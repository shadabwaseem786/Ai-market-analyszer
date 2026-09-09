// V116000 Decision Fusion Core — reconciles independent research dimensions. Research-only.
function clamp(x,a=0,b=100){return Math.max(a,Math.min(b,Number(x)||0))}
function fuse(input={}){
 const dims=["probability","expectedValue","risk","scenarioDominance","temporalFreshness","memory","causal","metaLearning","redTeam","dataQuality"];
 const w=Object.assign({probability:.18,expectedValue:.12,risk:.12,scenarioDominance:.10,temporalFreshness:.08,memory:.08,causal:.08,metaLearning:.08,redTeam:.10,dataQuality:.06},input.weights||{});
 let sum=0,ws=0; for(const k of dims){const v=clamp(input[k]??50); const wt=Number(w[k]??0); sum+=v*wt; ws+=wt}
 const quality=ws?sum/ws:0;
 const uncertainty=clamp(100-quality);
 let decision=quality>=72?"ACTIVITY_BIAS":quality>=52?"WAIT_WATCH":"ABSTAIN";
 if(Number(input.dataQuality)<60||Number(input.redTeam)<50||input.falsified===true)decision="ABSTAIN";
 return {version:"V116000",decision,decisionQuality:+quality.toFixed(2),uncertainty:+uncertainty.toFixed(2),dimensions:Object.fromEntries(dims.map(k=>[k,clamp(input[k]??50)])),researchOnly:true,automaticTrading:false};
}
module.exports={fuse};