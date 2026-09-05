const assert=require("node:assert/strict");
const ai=require("../netlify/functions/ai-engine.js");
const runtime=require("../netlify/functions/v730-runtime.js");
const cases=[
 {score:80,confidence:80,agreementPct:90,riskScore:10,dataHealth:100,catalystConfidence:80,catalystRisk:10,catalystFreshness:90},
 {score:20,confidence:80,agreementPct:90,riskScore:10,dataHealth:100,catalystConfidence:20,catalystRisk:10,catalystFreshness:90},
 {score:50,confidence:40,agreementPct:50,riskScore:80,dataHealth:50,catalystConfidence:40,catalystRisk:80,catalystFreshness:20}
];
for(const f of cases){const x=ai.infer(f);assert(x.aiProbability>=2&&x.aiProbability<=98);assert(x.confidence>=5&&x.confidence<=95);assert(x.uncertainty>=5&&x.uncertainty<=95);assert(["BULLISH","BEARISH","NEUTRAL"].includes(x.aiDirection));}
console.log("V730000 AI contract tests: PASS");

const decisionCases=[
 {m:{score:90,confidence:90,riskScore:5,dataHealth:100},c:{catalystBias:"BULLISH",catalystConfidence:90,catalystRisk:5,catalystHealth:100},a:{aiDirection:"BULLISH",aiProbability:90,confidence:90}},
 {m:{score:10,confidence:90,riskScore:5,dataHealth:100},c:{catalystBias:"BEARISH",catalystConfidence:90,catalystRisk:5,catalystHealth:100},a:{aiDirection:"BEARISH",aiProbability:10,confidence:90}},
 {m:{score:50,confidence:20,riskScore:90,dataHealth:0},c:{catalystBias:"NEUTRAL",catalystConfidence:0,catalystRisk:100,catalystHealth:0},a:{aiDirection:"NEUTRAL",aiProbability:50,confidence:5}}
];
for(const x of decisionCases){const d=runtime.combine(x.m,x.c,x.a);assert(["BUY","SELL","WAIT"].includes(d.decision));assert(d.confidence>=0&&d.confidence<=95);assert(d.riskScore>=0&&d.riskScore<=100);assert(["PASS","HOLD"].includes(d.gate));}
console.log("V730000 decision-fusion contract tests: PASS");

assert(runtime.catalystUsable({count:2,catalystHealth:50,catalystConfidence:50,catalystFreshness:50})===true);
assert(runtime.catalystUsable({count:2,catalystHealth:50,catalystConfidence:50,catalystFreshness:0})===false);
assert(runtime.catalystUsable({count:0,catalystHealth:0,catalystConfidence:0,catalystFreshness:0})===false);
console.log("V730000 catalyst freshness gate tests: PASS");
