'use strict';

const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');

module.exports = {
  entry: './index.js',
  format: 'iife',
  moduleName: 'chronokinesis',
  plugins: [
    commonjs({
      sourceMap: false
    }),
    babel({
      presets: ['es2015-rollup'],
      exclude: 'node_modules/**'
    })
  ],
  dest: 'dist/chronokinesis.js'
};
