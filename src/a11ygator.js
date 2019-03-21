const pa11y = require('pa11y');
const config = require('./config.js');
const _ = require('lodash');
const htmlReporter = require('./../dist/reporter.js');
const path = require('path');

module.exports = a11ygator;

/**
 * Entry point for a11ygator requests.
 *
 * @param {String} url url to check.
 * @param {Object} options query params from request.
 * @return {Promise}
 */
async function a11ygator(url, options) {
    const pa11yConfig = {};
    // merge base config with query options
    _.merge(pa11yConfig, config, options)

    // always make a screenshot
    const filename = parseFilename(url);
    const screenPath = `screenshots/${filename}.png`;
    pa11yConfig.screenCapture = path.resolve(__dirname, `../${screenPath}`);

    convertBooleans(pa11yConfig);   // parse configuration's boolean-like values

    return pa11y(url, pa11yConfig)
        .then(async function (res){
            res.screenPath = screenPath;
            const htmlReport = await htmlReporter.results(res);
            return Promise.resolve(htmlReport);
        })
        .catch((err) => {
            console.error('Failed to execute pa11y', err);
            err.error = 'Please insert a valid url.';
            return Promise.resolve(err);
        })
}

/**
 * Convert property values boolean-like strings in booleans.
 *
 * @param {Object} obj the object to parse.
 * @return {void}
 */
convertBooleans = function(obj) {
    Object.keys(obj).forEach((key) => {
        if (obj[key] == 'true') {
            obj[key] = true;
        }
        if (obj[key] == 'false') {
            obj[key] = false;
        }
    });
}

/**
 * Sobstitute '/' char with '_' in given string.
 *
 * @param {String} url
 * @return {String} modified string
 */
parseFilename = function(url) {
    return url.replace(/[/:.]/g, '_');
}
