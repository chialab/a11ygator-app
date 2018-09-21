import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import string from 'rollup-plugin-string';
import jst from 'rollup-plugin-jst';

export default {
    output: {
        format: 'umd',
    },
    plugins: [
        resolve(),
        commonjs({
            exclude: [
                'node_modules/pa11y/lib/vendor/HTMLCS.js',
                'node_modules/pa11y/lib/runner.js',
            ],
        }),
        jst({
            extensions: ['.tpl'],
        }),
        string({
            include: [
                '**/*.html',
                '**/*.css',
                'node_modules/pa11y/lib/vendor/HTMLCS.js',
                'node_modules/pa11y/lib/runner.js'
            ]
        }),
    ],
}