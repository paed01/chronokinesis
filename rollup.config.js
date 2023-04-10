import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './index.js',
  plugins: [
    commonjs({
      sourceMap: false,
    }),
  ],
  output: [
    {
      exports: 'named',
      file: 'dist/index.cjs',
      format: 'cjs',
    },
    {
      file: 'dist/chronokinesis.cjs',
      name: 'chronokinesis',
      format: 'umd',
    },
  ],
};
