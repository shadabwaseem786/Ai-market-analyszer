// V19200: dataset source manifest. Sources are inputs, never automatically trusted.
const SOURCES={
 indianMarketPipeline:{repo:"https://github.com/JATINDHURVE/Indian-market-data-pipeline",kind:"open-source-repository",instruments:["NIFTY","BANKNIFTY","FINNIFTY","INDIA_VIX"]},
 kiteHistory:{repo:"https://github.com/ashwanthkumar/kite-history",kind:"open-source-tooling",instruments:["NIFTY","BANKNIFTY","FINNIFTY"],derivatives:true},
 bankNiftyData:{repo:"https://github.com/sandeepkapri/BankNifty-Data",kind:"open-source-repository",instruments:["BANKNIFTY"]}
};
function manifest(){return {version:"V19200",generatedAt:new Date().toISOString(),sources:SOURCES,policy:"validate before training; no automatic trust; no execution"}}
module.exports={SOURCES,manifest};
