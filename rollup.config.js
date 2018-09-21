import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import string from 'rollup-plugin-string';

export default {
    output: {
        format: 'umd',
    },
    plugins: [
        resolve(),
        commonjs(),
        string({
            include: [
                '**/*.html',
                '**/*.tpl',
                '**/*.css',
                'node_modules/pa11y/lib/vendor/HTMLCS.js',
                'node_modules/pa11y/lib/runner.js'
            ]
        }),
    ],
}