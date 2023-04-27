import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/groundpound.js',
  output: {
    file: 'groundpound-compatibility.js',
    format: 'cjs'
  },
  plugins: [resolve(), babel({ babelHelpers: 'bundled' })]
};