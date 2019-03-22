const GoogleCloudAdapter = require('./googleCloud.js');
const LocalAdapter = require('./local.js');

const { screenshots } = require('../config.js');

/**
 * Filesystem adapter.
 *
 * @var {GoogleCloudAdapter | LocalAdapter}
 */
let adapter;
if (process.env.CLOUD_STORAGE_BUCKET) {
    adapter = new GoogleCloudAdapter({
        bucket: process.env.CLOUD_STORAGE_BUCKET,
        path: process.env.CLOUD_STORAGE_PREFIX || '',
    });
} else if (process.env.S3_BUCKET) {
    /** @todo */
    throw new Error('Not implemented');
} else {
    adapter = new LocalAdapter({
        path: process.env.SCREENSHOTS_PATH || screenshots,
    });
}

module.exports = adapter;
