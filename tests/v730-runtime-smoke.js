const assert = require('assert');
const runtime = require('../netlify/functions/v730-runtime.js');

function run() {
  const bullish = runtime.combine(
    { score: 82, confidence: 85, riskScore: 20, dataHealth: 100 },
    { catalystBias: 'BULLISH', catalystConfidence: 80, catalystRisk: 20, catalystHealth: 100 },
    { aiDirection: 'BULLISH', aiProbability: 78, confidence: 80 }
  );
  assert(['BUY', 'WAIT'].includes(bullish.decision));
  assert(bullish.confidence >= 0 && bullish.confidence <= 95);
  assert(bullish.riskScore >= 0 && bullish.riskScore <= 100);

  const contradictory = runtime.combine(
    { score: 80, confidence: 80, riskScore: 20, dataHealth: 100 },
    { catalystBias: 'BEARISH', catalystConfidence: 90, catalystRisk: 70, catalystHealth: 100 },
    { aiDirection: 'BEARISH', aiProbability: 25, confidence: 90 }
  );
  assert(['WAIT', 'SELL'].includes(contradictory.decision));

  const weak = runtime.combine(
    { score: 52, confidence: 45, riskScore: 70, dataHealth: 20 },
    { catalystBias: 'NEUTRAL', catalystConfidence: 0, catalystRisk: 100, catalystHealth: 0 },
    { aiDirection: 'NEUTRAL', aiProbability: 50, confidence: 20 }
  );
  assert.strictEqual(weak.decision, 'WAIT');

  const governance = runtime.combine(
    { score: 82, confidence: 85, riskScore: 20, dataHealth: 100 },
    { catalystBias: 'BULLISH', catalystConfidence: 80, catalystRisk: 20, catalystHealth: 100 },
    { aiDirection: 'BULLISH', aiProbability: 78, confidence: 80, uncertainty: 15, ensembleSpread: 5 }
  );
  assert(governance.governance.dataQuality >= 0);
  assert.strictEqual(governance.governance.counterfactualBreak, false);

  const triConflict = runtime.combine(
    { score: 82, confidence: 85, riskScore: 20, dataHealth: 100 },
    { catalystBias: 'BEARISH', catalystConfidence: 90, catalystRisk: 40, catalystHealth: 100 },
    { aiDirection: 'NEUTRAL', aiProbability: 50, confidence: 70, uncertainty: 20, ensembleSpread: 5 }
  );
  assert.strictEqual(triConflict.decision, 'WAIT');
  assert.strictEqual(triConflict.governance.counterfactualBreak, false);

  const lowQuality = runtime.combine(
    { score: 85, confidence: 90, riskScore: 10, dataHealth: 20 },
    { catalystBias: 'BULLISH', catalystConfidence: 90, catalystRisk: 10, catalystHealth: 100 },
    { aiDirection: 'BULLISH', aiProbability: 90, confidence: 90, uncertainty: 10, ensembleSpread: 2 }
  );
  assert.strictEqual(lowQuality.decision, 'WAIT');

  console.log('V730 runtime smoke tests passed');
}

run();
