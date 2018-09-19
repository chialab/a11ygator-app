const pa11y = require('pa11y');
const config = require('./config/base');
const _ = require('lodash');

const htmlReporter = require('pa11y-reporter-html');
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

    // alway make a screenshot
    const filename = parseFilename(url);
    pa11yConfig.screenCapture = `${__dirname}/screenshots/${filename}.png`;

    convertBooleans(pa11yConfig);

    return pa11y(url, pa11yConfig)
        .then(async function (res){
            // convert result in html
            let html = await htmlReporter.results(res, url);
            html = addImageToHtml(html, url);
            return Promise.resolve(html);
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
 * @param {String} url
 * @return {String} modified string
 */
parseFilename = function(url) {
    return url.replace(/[/:.]/g, '_');
}

/**
 * It adds an image element with 'filename' param as src on the given html.
 * @param {String} html html as string to modify
 * @param {String} filename image filename
 * @return {String} modified string
 */
addImageToHtml = function(html, filename) {
    // modify html

    let modifiedHtml = html;
    const htmlInsertIndex = modifiedHtml.indexOf('<p class="counts">') - 1;
    const imgString = `<img class="screenshot" src="/screenshots/${parseFilename(filename)}.png"/>`;
    modifiedHtml = modifiedHtml.slice(0, htmlInsertIndex) + imgString + modifiedHtml.slice(htmlInsertIndex);

    // modify inline css
    const cssInsertIndex = modifiedHtml.indexOf('<style>') + ('<style>').length + 1;
    modifiedHtml = modifiedHtml.slice(0, cssInsertIndex) + '.screenshot { border: 1px solid black; max-width: 100%; margin: 2em auto; display: block }' + modifiedHtml.slice(cssInsertIndex);

    return modifiedHtml;
}
