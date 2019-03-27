const express = require('express');
const { public } = require('./config.js');
const { report } = require('./a11ygator.js');
const AppError = require('./appError.js');
const adapter = require('./screenshots/index.js');

const router = express.Router()
    .use(express.json())
    .get('/report', report)
    .post('/report', report);

exports.app = express()
    .use('/screenshots', adapter.getMiddleware())
    .use('/', express.static(public), router)
    .use((err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }

        if (err instanceof AppError) {
            console.error(err.message, err.previous);

            res.status(err.status);
        }

        let errorTemplate = `<div>
            <h3>Whoops! Something went wrong with your request.</h3>
            <p>${err.status} - ${err.message}</p>
            <p>${err.previous}</p>
        </div>`;

        res.send(errorTemplate);
    });
