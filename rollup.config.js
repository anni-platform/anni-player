import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

const config = {
  external: ['react'],
  input: 'src/index.js',
  output: {
    file: 'index.js',
    format: 'cjs',
    name: 'index',
    globals: {
      react: 'React',
    },
    exports: 'named',
  },
  plugins: [babel(), terser()],
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: 'index.esm.js',
      format: 'esm',
    },
  },
];
