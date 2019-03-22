const express = require('express');
const uuidV4 = require('uuid/v4');
const { public, screenshots } = require('./config.js');
const { report } = require('./a11ygator.js');

const router = express.Router()
    .use((req, _, next) => {
        // Attach UUID to every incoming request.
        req.uuid = uuidV4();

        next();
    })
    .get('/report', report)
    .post('/report', report);

exports.app = express()
    .use('/screenshots', express.static(screenshots))
    .use('/', express.static(public), router);
