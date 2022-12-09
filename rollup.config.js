'use strict';

const babel = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  input: './index.js',
  plugins: [
    commonjs({
      sourceMap: false
    }),
    babel()
  ],
  output: [
    {
      name: 'chronokinesis',
      file: 'dist/chronokinesis.js',
      exports: 'named',
      format: 'iife',
    },
    {
      name: 'chronokinesis',
      file: 'dist/index.es.js',
      exports: 'named',
      format: 'es',
    }
  ]
};
