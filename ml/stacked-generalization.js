// V50300: stacked generalization contract with leakage-safe OOF inputs.
function stack(rows){return rows.filter(r=>r&&r.oof===true).map(r=>r.features||[])}module.exports={stack};