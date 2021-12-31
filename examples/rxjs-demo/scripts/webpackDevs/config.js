const path = require('path')
const config = {
  mode: 'development'
}

config.entry = {
  main: '/src/main.js',
  demo: { import: '/src/demo/index.js', filename: 'pages/demo.js' },
}

config.devServer = {
  static: {
    directory: path.join(__dirname, '../../public'),
  },
  compress: true,
  port: 4000,
}

module.exports = config