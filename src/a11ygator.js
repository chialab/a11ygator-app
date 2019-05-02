const pa11y = require('pa11y');
const { TimeoutError } = require('p-timeout');
const { pa11yConfig, MAX_TIMEOUT, MAX_WAIT } = require('./config.js');
const AppError = require('./appError.js');
const adapter = require('./screenshots/index.js');
const htmlReporter = require('./../dist/reporter.js');

/**
 * Do some transformation to raw config.
 * Take only `wait` and `timeout` from rawConfig.
 * Take default values if external ones exceed them.
 *
 * @param {Object} rawConfig Pa11y configuration as received in request.
 * @return {Object}
 */
const buildConfig = (rawConfig) => {
    if (!rawConfig) {
        return pa11yConfig;
    }

    let { wait, timeout } = pa11yConfig;
    if (rawConfig.wait) {
        wait = Math.min(parseInt(rawConfig.wait), MAX_WAIT);
    }
    if (rawConfig.timeout) {
        timeout = Math.min(Math.max(rawConfig.timeout, wait + 3000), MAX_TIMEOUT);
    }

    return Object.assign({}, pa11yConfig, { timeout, wait });
};

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
        next(new AppError('The URL is not valid', 400));

        return;
    }

    const config = buildConfig(req.body);
    config.screenCapture = true;

    // Run analysis.
    let results;
    try {
        results = await pa11y(url, config);
    } catch (err) {
        if (err instanceof TimeoutError) {
            next(new AppError('The request timed out', 504, err));
        } else {
            next(new AppError('Pa11y failed to execute', 400, err));
        }

        return;
    }

    // Copy screenshot to destination.
    try {
        const destFile = await adapter.write(results.screenshot);
        delete results.screenshot;
        results.screenPath = `screenshots/${destFile}`;
    } catch (err) {
        next(new AppError('The screenshot could not be saved', 504, err));

        return;
    }

    // Generate report.
    try {
        res.set({
            'Expires': 'Mon, 26 Jul 1997 05:00:00 GMT',
            'Last-Modified': (new Date()).toGMTString(),
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
        });

        if (req.query.format === 'html') {
            const html = await htmlReporter.results(results);

            return res.send(html);
        }

        return res
            .set('Content-Type', 'application/json')
            .send(results);
    } catch (err) {
        next(new AppError('The report could not be generated', 500, err));

        return;
    }
};
