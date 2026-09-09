'use strict';
const {adapt}=require('./_adapter');
const source=require('../netlify/functions/market-data');
module.exports=adapt(source.handler);
