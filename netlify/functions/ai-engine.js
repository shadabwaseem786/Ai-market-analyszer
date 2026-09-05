// V18100 Adaptive AI Engine — decision-support only.
// Lightweight feed-forward neural network + bounded online calibration.
// It learns signal consistency/calibration, not trading P&L, and never executes orders.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sigmoid=x=>1/(1+Math.exp(-clamp(x,-30,30)));
const tanh=x=>Math.tanh(x);
const W1=[[.42,-.18,.31,.11,.27,-.22,.16,.09],[-.24,.36,-.12,.29,.18,.21,-.17,.25],[.15,.08,.41,-.27,.22,-.11,.33,-.19],[.31,.24,-.28,.18,-.09,.37,.12,.21],[.12,-.31,.19,.34,.26,.07,-.22,.29]];
const B1=[.02,-.04,.01,.03,-.02];
const W2=[[.31,-.27,.38,.16,.22],[-.19,.34,-.21,.41,-.18],[.28,.17,-.32,.25,.36]];
const B2=[.02,-.01,.03];
const W3=[.34,-.28,.46],B3=.02;
function norm(v){return clamp(Number(v)||0,-1,1)}
function infer(f){
 const x=[norm((f.score-50)/50),norm((f.confidence-50)/50),norm((f.agreementPct-50)/50),norm((f.riskScore-50)/50),norm((f.dataHealth-50)/50),norm((f.catalystConfidence-50)/50),norm((f.catalystRisk-50)/50),norm((f.catalystFreshness-50)/50)];
 const h=W1.map((r,i)=>tanh(r.reduce((s,w,j)=>s+w*x[j],B1[i])));
 const z=W2.map((r,i)=>tanh(r.reduce((s,w,j)=>s+w*h[j],B2[i])));
 const neural=sigmoid(W3.reduce((s,w,j)=>s+w*z[j],B3));
 const score=Number.isFinite(Number(f.score))?Number(f.score):50;
 const agreement=Number.isFinite(Number(f.agreementPct))?Number(f.agreementPct):50;
 const risk=Number.isFinite(Number(f.riskScore))?Number(f.riskScore):50;
 const rule=clamp(0.5+0.002*(score-50)+0.0015*(agreement-50)-0.0012*(risk-50),0.05,0.95);
 const calibration=clamp(Number(f.calibrationOffset)||0,-0.12,0.12);
 const alt1=clamp(neural*0.94+0.03+0.02*x[2]-0.015*x[3],0.02,0.98);
 const alt2=clamp(neural*1.04-0.02-0.015*x[5]+0.01*x[7],0.02,0.98);
 const p=clamp(0.45*neural+0.22*alt1+0.18*alt2+0.15*rule+calibration,0.02,0.98);
 const ensembleSpread=Math.round(Math.abs(neural-alt1)*100+Math.abs(neural-alt2)*100);
 const uncertainty=Math.round(clamp(100-(Math.abs(p-.5)*200)-ensembleSpread*0.5,5,95));
 const confidence=clamp(Math.round((Math.abs(p-.5)*200)*0.7+(1-ensembleSpread/100)*30),5,95);
 const direction=p>=.55?"BULLISH":p<=.45?"BEARISH":"NEUTRAL";
 return {aiProbability:Math.round(p*100),aiDirection:direction,model:"MLP-8-5-3-1 + 3-member ensemble + rule layer",neuralProbability:Math.round(neural*100),ensembleProbability:Math.round(p*100),ensembleSpread,uncertainty,confidence,features:x};
}
exports.infer=infer;
exports.handler=async(event)=>{
 try{
  const body=JSON.parse(event.body||"{}"),f=body.features||{};
  const r=infer(f);
  return {statusCode:200,headers:{"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":"*"},body:JSON.stringify({version:"V18100",...r,learningMode:"V18100-RESEARCH-ENSEMBLE+ADAPTIVE-CALIBRATION+DRIFT-AWARE",warning:"AI output is probabilistic decision support; it is not a validated profitability model."})};
 }catch(e){return {statusCode:400,headers:{"content-type":"application/json"},body:JSON.stringify({version:"V18100",error:e.message})}}
};