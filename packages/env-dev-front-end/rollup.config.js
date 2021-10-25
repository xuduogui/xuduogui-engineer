/*
 * @Author: xuziyong
 * @Date: 2021-10-26 00:27:36
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-26 01:00:34
 * @Description: TODO
 */
import path from 'path'
import rs from 'rollup-plugin-node-resolve' // 依赖引用插件
import commonjs from 'rollup-plugin-commonjs' // commonjs模块转换插件
import { eslint } from 'rollup-plugin-eslint' // eslint插件
import ts from 'rollup-plugin-typescript2'
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
const getPath = _path => path.resolve(__dirname, _path)
import packageJSON from './package.json'

const mergeConfig = (defaultConfig, options) => Object.assign({}, defaultConfig, options)

const extensions = [
  '.js', '.ts', '.tsx'
]

const commonConfig = {
  input: getPath('./src/index.ts'),
  plugins: [
    commonjs(),
    ts(),
    rs({
      extensions
    }),
    // eslint(),
    
  ]
}

const outputConfigs = [
  {
    file: `${packageJSON.name}.cjs.prod.js`,
    format: 'cjs',
    plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'] })]
  },
  {
    file: `${packageJSON.name}.cjs.js`,
    format: 'cjs',
  }
]

const configs = outputConfigs.map(cf => mergeConfig(commonConfig, {output: cf}))

export default configs