// V115000 Adversarial Red-Team 2.0 — attempts to falsify the leading market thesis. Research-only.
const ATTACKS=["BEAR_ATTACK","BULL_ATTACK","VOLATILITY_ATTACK","LIQUIDITY_ATTACK","CATALYST_REVERSAL","MODEL_FAILURE","ANALOG_FAILURE","CORRELATION_BREAK","DATA_QUALITY","BLACK_SWAN"];
function attack(thesis={},evidence={}){
 const rows=ATTACKS.map((id,i)=>{const explicit=Number(evidence[id]); const score=Number.isFinite(explicit)?explicit:Math.max(0,Math.min(100,(Number(thesis.confidence)||50)+(i%3-1)*15)); return {id,challengeScore:+score.toFixed(1),passed:score<55,question:evidence.questions?.[id]||"What evidence would invalidate the thesis?"}});
 const failures=rows.filter(x=>!x.passed).length;
 return {version:"V115000",attacks:rows,failedAttacks:failures,robustness:+Math.max(0,100-failures/ATTACKS.length*100).toFixed(1),researchOnly:true};
}
module.exports={ATTACKS,attack};