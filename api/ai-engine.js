'use strict';
const {adapt}=require('./_adapter');
const source=require('../netlify/functions/ai-engine');
module.exports=adapt(source.handler);
