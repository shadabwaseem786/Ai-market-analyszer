// V21900: regime-specific model routing.
function route({regime,models={}}){const m=models[regime]||models.DEFAULT||null;return {regime,model:m,executionDisabled:true}}
module.exports={route};
