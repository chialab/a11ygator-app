const pa11y = require('pa11y');
const config = require('../config/base.json');
const _ = require('lodash');

console.log(config)

module.exports = chia11y;

/**
 * Entry point for chia11y requests.
 *
 * @param {String} url url to check.
 * @param {Object} options query params from request.
 */
async function chia11y(url, options){
    const pa11yConfig = _.merge(config, options)
    console.log('pa11yConfig', pa11yConfig)
}
