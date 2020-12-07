const path = require('path');

module.exports = {
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'www'),
    filename: 'bundle.js'
  },
    devServer: {
    contentBase: path.join(__dirname, 'www'),
    compress: false,
    port: 80,
    disableHostCheck: true,
    host: '0.0.0.0'
  }
};