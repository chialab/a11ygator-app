const path = require('path');
const { Storage } = require('@google-cloud/storage');
const uuidv4 = require('uuid/v4');
const BaseAdapter = require('./base.js');

/** @typedef {{ bucket: string, path?: string, validity?: number }} GoogleCloudAdapterOptions */

/**
 * Adapter to store screenshots in a local path.
 *
 * @property {GoogleCloudAdapterOptions} options
 * @property {Bucket} client
 */
class GoogleCloudAdapter extends BaseAdapter {

    /**
     * @inheritdoc
     *
     * @returns {GoogleCloudAdapterOptions}
     */
    get defaults() {
        return {
            bucket: undefined,
            path: '',
            validity: 3600,
        };
    }

    /**
     * @inheritdoc
     *
     * @param {GoogleCloudAdapterOptions} [options = {}]
     */
    constructor(options = {}) {
        super(options);

        const storage = new Storage();
        this.bucket = storage.bucket(this.options.bucket);
    }

    /**
     * @inheritdoc
     */
    async copy(tmpFile) {
        const fileName = `${uuidv4()}${path.extname(tmpFile)}`;
        const destination = path.join(this.options.path, fileName);

        await this.bucket.upload(tmpFile, { destination });

        return destination;
    }

    /**
     * @inheritdoc
     */
    getMiddleware() {
        /**
         * Redirect to Google Cloud Storage file.
         *
         * @param {Express.Request} req Request.
         * @param {Express.Response} req Response.
         * @param {(err?: any) => void} next Next middleware.
         * @returns {Promise<void>}
         */
        const middleware = async (req, res, next) => {
            const filePath = path.join(this.options.path, req.path.substr(1));

            try {
                const file = this.bucket.file(filePath);
                const [ url ] = await file.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + this.options.validity,
                });

                res.redirect(url, 302);
            } catch (err) {
                console.error('Unable to obtain signed URL', err);

                next();
            }
        };

        return middleware;
    }
};

module.exports = GoogleCloudAdapter;