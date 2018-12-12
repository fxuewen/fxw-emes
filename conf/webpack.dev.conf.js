const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf.js');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = merge(baseWebpackConfig, {
    devtool: '#source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
        new BrowserSyncPlugin({})
    ]
})
