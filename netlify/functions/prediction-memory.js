// V731.4 Prediction Memory — bounded, privacy-safe local memory for empirical calibration research.
// No broker/order execution. Stores only model outcome metadata supplied by the caller.
const MAX_RECORDS=500;
const memory=[];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function record(prediction,outcome){
 const p=clamp(Number(prediction?.probability??50),1,99);
 const actual=String(outcome?.actualDirection||"UNKNOWN").toUpperCase();
 const predicted=String(prediction?.decision||"WAIT").toUpperCase();
 const correct=predicted!=="WAIT"&&((predicted==="BUY"&&actual==="BUY")||(predicted==="SELL"&&actual==="SELL"));
 const row={id:Date.now()+"-"+Math.random().toString(36).slice(2,8),ts:new Date().toISOString(),probability:p,decision:predicted,actualDirection:actual,correct,regime:String(prediction?.regime||"UNKNOWN").toUpperCase()};
 memory.push(row); if(memory.length>MAX_RECORDS) memory.shift(); return row;
}
function calibrate(){
 const actionable=memory.filter(x=>x.decision!=="WAIT"&&x.actualDirection!=="UNKNOWN");
 if(!actionable.length) return {sampleSize:0,empiricalAccuracy:null,calibrationOffset:0,confidence:"INSUFFICIENT_DATA"};
 const accuracy=actionable.filter(x=>x.correct).length/actionable.length*100;
 const meanGap=actionable.reduce((s,x)=>s+(x.correct?100-x.probability:-x.probability),0)/actionable.length;
 return {sampleSize:actionable.length,empiricalAccuracy:Math.round(accuracy*10)/10,calibrationOffset:Math.round(clamp(meanGap*0.002,-12,12)*100)/100,confidence:actionable.length>=100?"ESTABLISHED":actionable.length>=30?"DEVELOPING":"EARLY"};
}
function summary(){return {version:"V731.4",...calibrate(),records:memory.length};}
exports.record=record; exports.calibrate=calibrate; exports.summary=summary;
exports.handler=async(event)=>{try{const body=JSON.parse(event.body||"{}"); if(body.action==="record") return {statusCode:200,headers:{"content-type":"application/json"},body:JSON.stringify(record(body.prediction||{},body.outcome||{}))}; return {statusCode:200,headers:{"content-type":"application/json","cache-control":"no-store"},body:JSON.stringify(summary())}}catch(e){return {statusCode:400,headers:{"content-type":"application/json"},body:JSON.stringify({version:"V731.4",error:e.message})}}};
