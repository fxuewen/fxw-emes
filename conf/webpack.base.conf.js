const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const extractCSS = new ExtractTextPlugin('stylesheets/[name]-one.css');

module.exports = {
    output: {
        path: __dirname + '/dist',
        filename: '[name].min.js',
    },
    module: {
        loaders: [{
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                            loader: 'css-loader?sourceMap'
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: [
                                    require('autoprefixer')({
                                        broswer: 'last 5 versions'
                                    }),
                                ]
                            }
                        }
                    ]
                })
            },
            {
                test: /\.html$/,
                loader: 'html-loader!html-minify-loader'
            },
            {
                // 图片加载器，雷同file-loader，更适合图片，可以将较小的图片转成base64，减少http请求
                // 如下配置，将小于8192byte的图片转成base64码
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader?limit=8192&name=./assets/images/[hash].[ext]',
            },
            {
                // 专供iconfont方案使用的，后面会带一串时间戳，需要特别匹配到
                test: /\.(woff|woff2|svg|eot|ttf)\??.*$/,
                loader: 'file-loader?name=./assets/fonts/[name].[ext]',
            },
        ]
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
        }
    },
    entry: {
        utils: ['date-format-lite'],
        jquery: [
            './src/lib/fileUpload/easy-upload.css',
            './src/lib/fileUpload/easyUpload.js',
            'ztree/css/zTreeStyle/zTreeStyle.css',
            'ztree/js/jquery.ztree.core.js',
            'ztree/js/jquery.ztree.exhide.js',
            'ztree/js/jquery.ztree.excheck.js',
            'jqGrid/css/ui.jqgrid-bootstrap.css',
            'jqGrid/js/jquery.jqGrid.min.js',
            'jqGrid/js/grid.grouping.js',
            'jqGrid/js/grid.inlinedit.js',
            'jqGrid/js/i18n/grid.locale-en.js'
        ],
        bootstrap: [
            'bootstrap/dist/js/bootstrap.min.js',
            'bootstrap/dist/css/bootstrap.min.css',
            'bootstrap-select/dist/css/bootstrap-select.min.css',
            'bootstrap-select/dist/js/bootstrap-select.min.js',
            'bootstrap-daterangepicker/daterangepicker.css',
            'bootstrap-daterangepicker/daterangepicker.js',
            './src/lib/font-awesome/css/font-awesome.min.css',
            './src/lib/Ionicons/css/ionicons.min.css',
            './src/lib/AdminLTE-2.4.3/dist/css/AdminLTE.min.css',
            './src/lib/AdminLTE-2.4.3/dist/css/skins/_all-skins.min.css',
            './src/lib/AdminLTE-2.4.3/dist/js/adminlte.min.js',
            'webuploader/dist/webuploader.css'
        ],
        bundle: './src/app.js',
        login: './src/login.js',
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": "jquery",
            Handlebars: 'handlebars',
            WebUploader: 'webuploader'
        }),
        new ExtractTextPlugin('[name].min.css'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['manifest', 'utils', 'jquery', 'bootstrap', 'bundle']
        }),
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            chunks: ['manifest', 'utils', 'jquery', 'bootstrap', 'bundle'],
            chunksSortMode: 'manual'
        }),
        new htmlWebpackPlugin({
            filename: 'login.html', // 配置输出文件名和路径
            template: './src/login.html', // 配置文件模板
            chunks: ['login']
        }),
    ]
};
