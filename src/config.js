const path = require('path');

const wait = 8000;
const timeout = 10000;

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
