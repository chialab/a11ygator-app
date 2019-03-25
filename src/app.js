const express = require('express');
const { public } = require('./config.js');
const { report } = require('./a11ygator.js');
const adapter  = require('./screenshots/index.js');

const router = express.Router()
    .use(express.json())
    .get('/report', report)
    .post('/report', report);

exports.app = express()
    .use('/screenshots', adapter.getMiddleware())
    .use('/', express.static(public), router);
