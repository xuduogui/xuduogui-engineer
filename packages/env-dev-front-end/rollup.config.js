/*
 * @Author: xuziyong
 * @Date: 2021-10-26 00:27:36
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-30 18:52:36
 * @Description: TODO
 */
import path from 'path'
import rs from '@rollup/plugin-node-resolve' // 依赖引用插件
import commonjs from '@rollup/plugin-commonjs' // commonjs模块转换插件
import ts from 'rollup-plugin-typescript2'
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";
const getPath = _path => path.resolve(__dirname, _path)
import packageJSON from './package.json'
const os = require('os');
const cpus = os.cpus()

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
    // eslint(),
  ]
}

const outputConfigs = [
  {
    file: `./dist/${packageJSON.name}.cjs.prod.js`,
    format: 'cjs',
    plugins: [
      getBabelOutputPlugin({ presets: ['@babel/preset-env'] }),
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
    file: `./dist/${packageJSON.name}.cjs.js`,
    format: 'cjs',
  }
]

const configs = outputConfigs.map(cf => mergeConfig(commonConfig, {output: cf}))

export default configs