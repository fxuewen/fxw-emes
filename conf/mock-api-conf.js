const MockApiMiddleware = require('mock-api-middleware');

/**
 * 导出为mockapi的数组，两个路径分别为路由前缀，json文件所处目录
 * 请求地址为： 前缀/json文件所处目录
 * 如： http://localhost:3000/mockapi/log-report
 */
module.exports = [
    MockApiMiddleware('/privilege', {mockPath: './mocks/'}),
    MockApiMiddleware('/mes', {mockPath: './mocks/'}),
];
