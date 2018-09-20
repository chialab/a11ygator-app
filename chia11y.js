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
    // merge base config with query options
    _.merge(pa11yConfig, config, options)

    // always make a screenshot
    const filename = parseFilename(url);
    pa11yConfig.screenCapture = `${__dirname}/screenshots/${filename}.png`;

    convertBooleans(pa11yConfig);   // parse configuration's boolean-like values

    return pa11y(url, pa11yConfig)
        .then(async function (res){
            res.issues = orderIssuesByTypeCode(res.issues);

            // convert result in html
            let html = await htmlReporter.results(res, url);
            html = addImageToHtml(html, url);
            html = addDocumentTitleToHtml(html, res.documentTitle);
            return Promise.resolve(html);
        })
        .catch((err) => {
            console.error('Failed to execute pa11y', err);
            return Promise.reject(err);
        })
}

/**
 * Sort issues based on their criticity. It uses typecode property.
 *
 * @param {Array<Object>} issues issues to sort
 * @returns {Array<Object>} sorted issues
 */
orderIssuesByTypeCode = function(issues) {
    return issues.sort((a, b) => parseFloat(a.typeCode) - parseFloat(b.typeCode));
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

/**
 * It adds an image element with 'filename' param as src on the given html.
 *
 * @param {String} html html as string to modify
 * @param {String} filename image filename
 * @return {String} modified string
 */
addImageToHtml = function(html, filename) {
    // modify html
    let modifiedHtml = html;
    const htmlInsertIndex = modifiedHtml.indexOf('<p class="counts">') - 1;
    const imgString =
        `<div class='screenshot-container'>
            <div class="buttons-container">
                <div class="button-osx close"></div>
                <div class="button-osx minimize"></div>
                <div class="button-osx zoom"></div>
            </div>
            <img class="screenshot" src="/screenshots/${parseFilename(filename)}.png"/>
        </div>`;
    modifiedHtml = modifiedHtml.slice(0, htmlInsertIndex) + imgString + modifiedHtml.slice(htmlInsertIndex);

    // modify inline css
    const cssInsertIndex = modifiedHtml.indexOf('<style>') + ('<style>').length + 1;
    const css =
        `.screenshot { max-width: 100%;display: block; }
        .screenshot-container { border: solid #d5d5d5; border-width: 30px 4px 4px; border-radius: 4px; overflow: scroll; max-height: 500px; margin: 2em auto; display: block;}
        .buttons-container { position: absolute; margin-top: -24px; margin-left: 5px; }
        .button-osx { width: 10px; height: 10px; display: inline-block; border-radius: 10px;}
        .close {background: #ff5c5c; border: 1px solid #e33e41;}
        .minimize {background: #ffbd4c; border: 1px solid #e09e3e;}
        .zoom {background: #00ca56; border: 1px solid #14ae46;}`;
    modifiedHtml = modifiedHtml.slice(0, cssInsertIndex) + css + modifiedHtml.slice(cssInsertIndex);

    return modifiedHtml;
}

/**
 * It replaces given title with current html title.
 * @param {String} html html as string to modify
 * @param {String} title document title
 * @return {String} modified string
 */
addDocumentTitleToHtml = function(html, title) {
    // modify title html
    return html.replace(/Accessibility Report For "[^"]*"/gi, `Accessibility Report For "${title}"`);
}
