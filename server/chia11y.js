const pa11y = require('pa11y');
const config = require('../config/base.json');
const _ = require('lodash');

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
    _.merge(pa11yConfig, config, options)
    const cleanedUrl = url.replace(/(^\w+:|^)\/\//, ''); // pa11y doesn't like the boring 'http' part
    if (pa11yConfig.screenCapture) {
        const filename = cleanedUrl.split('/').join('_');
        console.log('fi', filename);
        pa11yConfig.screenCapture = `${__dirname}/screenshots/${filename}.png`;
    }
    convertBooleans(pa11yConfig);

    let result;
    return pa11y(cleanedUrl, pa11yConfig)
        .then((res) => {
            return Promise.resolve(res);
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
