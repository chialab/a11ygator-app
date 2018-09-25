import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import string from 'rollup-plugin-string';
import jst from 'rollup-plugin-jst';

export default {
    output: {
        format: 'umd',
        strict : false,
    },
    plugins: [
        resolve(),
        commonjs(),
        jst({
            extensions: ['.tpl'],
        }),
        string({
            include: [
                '**/*.html',
                '**/*.css',
            ]
        }),
    ],
}