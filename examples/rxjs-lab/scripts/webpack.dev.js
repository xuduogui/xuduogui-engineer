const Webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const devConfig = require('./webpackDevs/config')

const compiler = Webpack(devConfig, (err, stats) => {
  // [Stats Object](#stats-object)
  if (err) {
    console.error(err.stack || err)
    if (err.details) {
      console.error(err.details)
    }
    return
  }

  const info = stats.toJson()

  if (stats.hasErrors()) {
    console.error(info.errors)
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings)
  }
})

const devServerOptions = {
  ...devConfig.devServer,
  open: true
}

const server = new WebpackDevServer(devServerOptions, compiler)

const runServer = async () => {
  console.log(`webpack 开始运行！`)

  await server.start()

  console.log(`webpack 运行成功： http://localhost:${devConfig.devServer.port}`)
}

runServer()
