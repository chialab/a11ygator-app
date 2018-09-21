const pa11y = require('pa11y');
const config = require('@chialab/chia11y-config');
const _ = require('lodash');
const htmlReporter = require('@chialab/pa11y-reporter-html');
const DomParser = require('dom-parser');

module.exports = chia11y;

/**
 * Entry point for chia11y requests.
 *
 * @param {String} url url to check.
 * @param {Object} options query params from request.
 * @return {Promise}
 */
async function chia11y(url, options) {
    const pa11yConfig = {};
    // merge base config with query options
    _.merge(pa11yConfig, config, options)

    // always make a screenshot
    const filename = parseFilename(url);
    const screenPath = `/screenshots/${filename}.png`;
    pa11yConfig.screenCapture = `${__dirname}${screenPath}`;

    convertBooleans(pa11yConfig);   // parse configuration's boolean-like values

    return pa11y(url, pa11yConfig)
        .then(async function (res){
            res.screenPath = screenPath;
            const htmlReport = await htmlReporter.results(res);
            return Promise.resolve(htmlReport);
        })
        .catch((err) => {
            console.error('Failed to execute pa11y', err);
            return Promise.reject(err);
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
