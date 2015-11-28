require('./environment')
var path = require('path');
var webpack = require('webpack');
var entry = (process.env.NODE_ENV == 'production') ?
  ['./src/index'] : ['webpack-dev-server/client?http://sparo-merchant-script.local:8080', 'webpack/hot/only-dev-server', './src/index'];

var devtool = (process.env.NODE_ENV == 'production') ? 'source-map' : 'eval';

module.exports = {
  devtool: devtool,
  entry: entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'sparo.js',
    publicPath: '/build/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({compress: { warnings: false }, mangle: true, comments: false}),
    new webpack.DefinePlugin({
      IFRAME_SRC: JSON.stringify(process.env.IFRAME_SRC),
      TXAPI_URL: JSON.stringify(process.env.TXAPI_URL)
    })

  ],
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  resolve: {
    extensions: ['','.js']
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.(png|gif)$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/, loader: "file-loader" },
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel?presets[]=es2015' },
      { test: /\.html$/, loader: "html?interpolate" }
    ]
  }
};
