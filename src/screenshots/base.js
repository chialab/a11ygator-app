/** @typedef {{}} BaseAdapterOptions */

/**
 * Base screenshots adapter class.
 *
 * @property {BaseAdapterOptions} options
 */
class BaseAdapter {
    /**
     * Default adapter options.
     *
     * @returns {BaseAdapterOptions}
     */
    get defaults() {
        return {};
    }

    /**
     * Initialize screenshots adapter.
     *
     * @param {BaseAdapterOptions} [options = {}] Adapter options.
     */
    constructor(options = {}) {
        this.options = Object.assign({}, this.defaults, options);
    }

    /**
     * Copy screenshot to destination.
     *
     * @param {string} tmpFile Temporary file where screenshot is stored.
     * @returns {Promise<string>} URL where screenshot can be accessed.
     */
    copy(tmpFile) {
        throw new Error('Not implemented');
    }

    /**
     * Get Express middleware to serve screenshots.
     *
     * @returns {(req: Express.Request, res: Express.Response, next: (err?: any) => void)}
     */
    getMiddleware() {
        return (req, res, next) => {
            next();
        };
    }
};

module.exports = BaseAdapter;
