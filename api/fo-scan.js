'use strict';
const {adapt}=require('./_adapter');
const source=require('../netlify/functions/fo-scan');
module.exports=adapt(source.handler);
