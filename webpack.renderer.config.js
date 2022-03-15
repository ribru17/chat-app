/* eslint-disable @typescript-eslint/no-var-requires */
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const assets = ['static'];
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const copyPlugins = assets.map(asset => {
  return new CopyWebpackPlugin({patterns: [
    {
      from: path.resolve( __dirname, 'src', asset),
      to: path.resolve(__dirname, '.webpack/renderer', asset)
    }
  ]});
});

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  
});

module.exports = {
  module: {
    rules,
    
  },
  
//   plugins: plugins,
  plugins: [...plugins, ...copyPlugins],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
  devtool: 'cheap-module-source-map',
//   devtool: 'nosources-source-map',
};
