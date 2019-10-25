const path = require('path');

module.exports = {
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
    devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    port: 80
  }
};