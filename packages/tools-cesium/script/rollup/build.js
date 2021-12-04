const path = require('path')
const rs = require('@rollup/plugin-node-resolve') // 依赖引用插件
const commonjs = require('@rollup/plugin-commonjs') // commonjs模块转换插件
const ts = require('rollup-plugin-typescript2')
const { getBabelOutputPlugin } = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const getPath = _path => path.resolve(__dirname, _path)
const packageJSON = require('../../package.json')
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

module.exports = configs