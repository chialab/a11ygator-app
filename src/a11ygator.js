const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const pa11y = require('pa11y');
const { pa11yConfig, screenshots } = require('./config.js');
const htmlReporter = require('./../dist/reporter.js');

const copyFile = util.promisify(fs.copyFile);

/**
 * Entry point for a11ygator requests.
 *
 * @param {Express.Request} req Express request.
 * @param {Express.Response} res Express response.
 * @return {Promise<Express.Response>}
 */
exports.report = async (req, res) => {
    const url = req.query.url;
    if (!url) {
        throw new Error('Missing URL');
    }

    const options = {}; // TODO
    const config = Object.assign({}, pa11yConfig, options);

    // Screenshot configuration.
    const fileName = `${req.uuid}.png`;
    const tmpFile = path.join(os.tmpdir(), fileName);
    config.screenCapture = tmpFile;

    try {
        const results = await pa11y(url, config);

        // Copy screenshot from temporary directory to final destination.
        const destFile = path.join(screenshots, fileName);
        await copyFile(tmpFile, destFile);

        const screenPath = `screenshots/${fileName}`;
        results.screenPath = screenPath;

        const html = await htmlReporter.results(results);

        return res.send(html);
    } catch (err) {
        console.error('Failed to execute pa11y', err);

        err.error = 'Please insert a valid url.';

        throw err;
    }
};
