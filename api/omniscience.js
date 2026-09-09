'use strict';
const {adapt}=require('./_adapter');
const source=require('../netlify/functions/omniscience');
module.exports=adapt(source.handler);
