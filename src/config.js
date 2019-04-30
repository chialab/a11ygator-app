const path = require('path');

const timeoutSec = process.env.FUNCTION_TIMEOUT_SEC ? (parseInt(process.env.FUNCTION_TIMEOUT_SEC, 10) - 1) : 10;
const timeout = timeoutSec * 1000;
const wait = Math.round(timeout * .75);

exports.pa11yConfig = {
    includeNotices: true,
    includeWarnings: true,
    standard: 'WCAG2AAA',
    wait,
    timeout,
    chromeLaunchConfig: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
        ],
    },
    log: {
        debug: console.log,
        error: console.error,
        info: console.info,
    },
};

exports.public = path.resolve(__dirname, '..', 'public');

exports.screenshots = path.resolve(__dirname, '..', 'screenshots');
