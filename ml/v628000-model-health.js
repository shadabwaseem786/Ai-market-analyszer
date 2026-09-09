// V628000 Model Health Monitor.
function assess(models=[]){return {version:"V628000",models:models.map(m=>({...m,health:Number(m.health??m.score??0)})),researchOnly:true};} module.exports={assess};