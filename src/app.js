// 自定义css引入
import './css/main.css';

// 扩展引入
import jqExtendsFn from './common/jquery-extend';
// 引入handlebars 自定义helper
import './common/handlebars-helpers';
// 引入i18n
import './i18n/i18n';

import main from './common/main';

$.jgrid.defaults.styleUI = 'Bootstrap';
// jquery 扩展
$.fn.extend(jqExtendsFn); // 增加jquery.fn方法

// 程序入口
main.init();
