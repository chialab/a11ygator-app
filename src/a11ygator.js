const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const pa11y = require('pa11y');
const { pa11yConfig } = require('./config.js');
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
 * @return {Promise<Express.Response>}
 */
exports.report = async (req, res) => {
    const url = req.query.url;
    if (!url) {
        throw new Error('Missing URL');
    }

    const options = req.body || {};
    const config = Object.assign({}, pa11yConfig, options);

    // Setup temporary file for screenshot.
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'a11ygator-'));
    const tmpFile = path.join(tmpDir, 'screenshot.png');
    config.screenCapture = tmpFile;

    // Run analysis.
    let results;
    try {
        results = await pa11y(url, config);
    } catch (err) {
        console.error('Failed to execute pa11y', err);

        throw err;
    }

    // Copy screenshot to destination.
    try {
        const destFile = await adapter.copy(tmpFile);
        results.screenPath = `screenshots/${destFile}`;
    } catch (err) {
        console.error('Failed to copy screenshot', err);

        throw err;
    } finally {
        // Cleanup.
        await unlink(tmpFile);
        await rmdir(tmpDir);
    }

    // Generate report.
    try {
        const html = await htmlReporter.results(results);

        return res.send(html);
    } catch (err) {
        console.error('Failed to generate report', err);

        throw err;
    }
};
