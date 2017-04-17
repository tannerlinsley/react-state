const webpack = require('webpack')
module.exports = {
  entry: './lib/index.js',
  output: {
    filename: './codux.js',
    libraryTarget: 'umd',
    library: 'Codux'
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
}
