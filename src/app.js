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
            console.error(`${err.status} - ${err.message}`, err.previous);

            res.status(err.status);
        }

        const { bugs } = require('../package.json');
        let errorTemplate = `<div>
            <h3>Whoops! ${err.message}. Please check your URL and try again, or <a href="${bugs.url}" target="_blank">open an issue on GitHub</a>!</h3>
        </div>`;

        res.send(errorTemplate);
    });
