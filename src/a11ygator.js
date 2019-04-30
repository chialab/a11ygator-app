const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const pa11y = require('pa11y');
const { pa11yConfig } = require('./config.js');
const AppError = require('./appError.js');
const adapter = require('./screenshots/index.js');
const htmlReporter = require('./../dist/reporter.js');

const mkdtemp = util.promisify(fs.mkdtemp);
const rmdir = util.promisify(fs.rmdir);
const unlink = util.promisify(fs.unlink);

/**
 * Entry point for a11ygator requests.
 *
 * @param {Express.Request} req Express request.
 * @param {Express.Response} res Express response.
 * @return {Promise<void>}
 */
exports.report = async (req, res, next) => {
    const url = req.query.url;
    if (!url) {
        next(new AppError('Missing URL', 400));

        return;
    }

    const config = buildConfig(req.body);
    config.screenCapture = true;

    // Run analysis.
    let results;
    try {
        results = await pa11y(url, config);
    } catch (err) {
        next(new AppError('Failed to execute Pa11y', 400, err));

        return;
    }

    // Copy screenshot to destination.
    try {
        const destFile = await adapter.write(results.screenshot);
        results.screenPath = `screenshots/${destFile}`;
    } catch (err) {
        next(new AppError('Failed to write screenshot', 504, err));

        return;
    }

    // Generate report.
    try {
        const html = await htmlReporter.results(results);

        return res
            .set({
                'Expires': 'Mon, 26 Jul 1997 05:00:00 GMT',
                'Last-Modified': (new Date()).toGMTString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
            })
            .send(html);
    } catch (err) {
        next(new AppError('Failed to generate report', 500, err));

        return;
    }
};

/**
 * Do some transformation to raw config.
 * Take only `wait` and `timeout` from rawConfig.
 * Take default values if external ones exceed them.
 *
 * @param {Object} rawConfig
 * @return {Object} Refined config object.
 */
const buildConfig = (rawConfig) => {
    if (!rawConfig) {
        return pa11yConfig;
    }

    let { timeout, wait } = rawConfig;

    timeout = Math.min(parseInt(timeout) || pa11yConfig.timeout, pa11yConfig.timeout);
    wait = Math.min(parseInt(wait) || pa11yConfig.wait, pa11yConfig.wait);

    return Object.assign({}, pa11yConfig, { timeout, wait });
};
