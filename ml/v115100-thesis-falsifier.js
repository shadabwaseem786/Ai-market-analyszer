// V115100 thesis falsification engine.
function falsify(thesis={},conditions=[]){
 const hits=conditions.filter(c=>c.triggered===true);
 const material=hits.filter(c=>Number(c.materiality??50)>=60);
 return {version:"V115100",conditionsChecked:conditions.length,triggered:hits.length,materialInvalidators:material.map(x=>x.name||"unnamed"),status:material.length?"FALSIFIED_OR_COMPROMISED":"NOT_FALSIFIED",requiresReview:material.length>0};
}
module.exports={falsify};