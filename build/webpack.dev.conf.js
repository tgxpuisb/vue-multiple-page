const fs = require('fs')
const path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

const entries = baseWebpackConfig.entry
const chunksObject = Object.keys(entries).map(pathname => {
  let templatePath = '!!ejs-full-loader!src/template/layout.html'
  try {
    let stat = fs.statSync(path.join(__dirname, '..', 'src/app', pathname) + '/index.html')
    if (stat && stat.isFile()) {
      templatePath = '!!ejs-full-loader!src/app/' + pathname + '/index.html'
    }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }
  }
  return {
    pathname,
    templatePath
  }
})
if (!Array.isArray(baseWebpackConfig.plugins)) {
  baseWebpackConfig.plugins = []
}
chunksObject.forEach(item => {
  let conf = {
    filename: './' + item.pathname + '.html',
    template: item.templatePath,
    inject: false
  }

  if (item.pathname in baseWebpackConfig.entry) {
    conf.inject = 'body'
    conf.chunks = [item.pathname]
  }

  baseWebpackConfig.plugins.push(new HtmlWebpackPlugin(conf))
})


module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    /*
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    */
    new FriendlyErrorsPlugin()
  ]
})
