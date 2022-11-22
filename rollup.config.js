import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
export default [
  {
    input: `src/mathmesh.ts`,
    plugins: [esbuild(),json(),terser(),commonjs()],
    output: [
      {
        file: `dist/mathmesh.js`,
        format: 'es',
        sourcemap: false,

        
        // exports: 'default',
      },
      
    ]
   
  },
  {
    input: `src/mathmesh.ts`,
    plugins: [dts()],
    output: {
      file: `dist/mathmesh.d.ts`,
      format: 'es',
    },
  }
]