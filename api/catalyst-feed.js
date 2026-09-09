'use strict';
const {adapt}=require('./_adapter');
const source=require('../netlify/functions/catalyst-feed');
module.exports=adapt(source.handler);
