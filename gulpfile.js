const gulp = require('gulp');
const browserSync = require('browser-sync');
const webpack = require('webpack');
const gulpWebpack = require('gulp-webpack');
const clean = require('gulp-clean');
const mockApis = require('./conf/mock-api-conf');
const prodWebpackConfig = require('./conf/webpack.prod.conf');
const devWebpackConfig = require('./conf/webpack.dev.conf');
const reload = browserSync.reload;

gulp.task('clean', function (done) {
    return gulp.src('./dist')
        .pipe(clean(done));
});

gulp.task('webpack', function () {
    const myConfig = Object.create(prodWebpackConfig);
    return gulp.src('./src/app.js')
        .pipe(gulpWebpack(myConfig, webpack))
        .pipe(gulp.dest('./dist'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('webpack-dev', function () {
    const myConfig = Object.create(devWebpackConfig);
    return gulp.src('./src/app.js')
        .pipe(gulpWebpack(myConfig, webpack))
        .pipe(gulp.dest('./dist'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('watch', function () {
    gulp.watch('src/*', ['webpack-dev']);
    gulp.watch('src/*/*', ['webpack-dev']);
    gulp.watch('src/*/*/*', ['webpack-dev']);
    gulp.watch('src/*/*/*/*', ['webpack-dev']);
});

gulp.task('default', ['clean', 'webpack']);

gulp.task('serve', ['clean', 'webpack-dev', 'watch'], function () {
    // 从这个项目的根目录启动服务器
    browserSync({
        server: {
            baseDir: './dist/'
        },
        middleware: mockApis
    });
});

gulp.task('remote', ['clean', 'webpack-dev', 'watch'], function () {
    // 从这个项目的根目录启动服务器
    browserSync({
        serveStatic: ['./dist/'],
        proxy: '192.168.10.232:8769'
    });
});
