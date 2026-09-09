// V588000 Scenario Decision Matrix.
function build(scenarios=[]){return {version:"V588000",matrix:scenarios.map(s=>({...s,decision:s.decision||"WAIT"})),researchOnly:true};} module.exports={build};