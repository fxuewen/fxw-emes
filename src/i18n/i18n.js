/* eslint-disable camelcase */
import DI18n from 'di18n-translate';
import zh_CN from './zh-cn';
import en_US from './en-us';

const messages = {
    zh_CN,
    en_US
};

const locale = localStorage.getItem('language') || 'zh_CN';

const di18n = new DI18n({
    locale, // 语言环境
    isReplace: false, // 是否开始运行时(适用于没有使用任何构建工具开发流程)
    messages // 语言映射表
});

export default di18n;
