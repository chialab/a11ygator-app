const fs = require('fs');
const path = require('path');
const util = require('util');
const express = require('express');
const uuidv4 = require('uuid/v4');
const BaseAdapter = require('./base.js');
const { screenshots } = require('../config.js');

const copyFile = util.promisify(fs.copyFile);

/** @typedef {{ path?: string }} LocalAdapterOptions */

/**
 * Adapter to store screenshots in a local path.
 *
 * @property {LocalAdapterOptions} options
 */
class LocalAdapter extends BaseAdapter {

    /**
     * @inheritdoc
     *
     * @returns {LocalAdapterOptions}
     */
    get defaults() {
        return {
            path: undefined,
        };
    }

    /**
     * @inheritdoc
     *
     * @param {LocalAdapterOptions} [options = {}]
     */
    constructor(options = {}) {
        super(options);
    }

    /**
     * @inheritdoc
     */
    async copy(tmpFile) {
        const fileName = `${uuidv4()}${path.extname(tmpFile)}`;
        const destFile = path.join(this.options.path, fileName);

        await copyFile(tmpFile, destFile);

        return fileName;
    }

    /**
     * @inheritdoc
     */
    getMiddleware() {
        return express.static(this.options.path);
    }
};

module.exports = LocalAdapter;