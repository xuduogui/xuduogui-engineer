import path from 'path'
import rs from '@rollup/plugin-node-resolve' // 依赖引用插件
import commonjs from '@rollup/plugin-commonjs' // commonjs模块转换插件
import ts from 'rollup-plugin-typescript2'
import { babel } from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve'
import { terser } from "rollup-plugin-terser";
const getPath = _path => path.resolve(__dirname, _path)
import packageJSON from './package.json'
const os = require('os');
const cpus = os.cpus()

console.log(process.env.NODE_ENV)

const mergeConfig = (defaultConfig, options) => Object.assign({}, defaultConfig, options)

const extensions = [
  '.js', '.ts', '.tsx'
]

let tsconfigDefaults = { compilerOptions: { } };
let tsconfigOverride = { compilerOptions: { module: 'ESNext' } };
let tsconfigUrl = 'tsconfig.json'

const commonConfig = {
  input: getPath('./src/index.ts'),
  plugins: [
    commonjs(),
    ts({
      tsconfigDefaults,
      tsconfig: tsconfigUrl,
      tsconfigOverride
    }),
    rs({
      extensions
    }),
    babel({ babelHelpers: 'bundled' }),
    // eslint(),
  ]
}

const outputConfigs = [
  {
    file: `dist/${packageJSON.name}.iife.prod.js`,
    format: 'iife',
    plugins: [
      terser({
        format: {
          comments: false
        },
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        numWorkers: cpus.length
      })
    ]
  },
  {
    file: `dist/${packageJSON.name}.iife.js`,
    format: 'iife',
  }
]

if (process.env.NODE_ENV === 'devlopment') {
  commonConfig.plugins.push(serve({
    port: 10001,
    contentBase: './'
  }))
}

const configs = outputConfigs.map(cf => {
  cf.name = 'tolCM'
  return mergeConfig(commonConfig, {output: cf})
})

export default configs