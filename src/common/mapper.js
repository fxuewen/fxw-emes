// 基础信息
import manpower from './base-info/manpower/manpower';
import department from './base-info/department/department';
import client from './base-info/client/client';
import productType from './base-info/product-type/product-type';
import job from './base-info/job/job';
import supplier from './base-info/supplier/supplier';
import factory from './base-info/factory/factory';
import equipment from './base-info/equipment/equipment';
import area from './base-info/area/area';
import line from './base-info/line/line';
import procedure from './base-info/procedure/procedure';
// 系统管理
import systemField from './sys-manage/system-field/system-field';
import onlineUser from './sys-manage/online-user/online-user';
import task from './sys-manage/task/task';
import privilege from './sys-manage/privilege/privilege';
import log from './sys-manage/log/log';
import interfaceInfo from './sys-manage/Interface/Interface';
import sysSet from './sys-manage/system-setting/sys-setting';
// 业务管理
import ProductManage from './bus-manage/product-manage/product-manage';
import projectManage from './bus-manage/project-manage/project-manage';
import bomManage from './bus-manage/bom-manage/bom-manage';
import orderManage from './bus-manage/order-manage/order-manage';
// 工艺管理
import ProcessDesign from './process/process-design/process-design';
import ProcessKnowledge from './process/process-knowledge/process-knowledge';
import processCardManage from './process/processCard-manage/processCard-manage';
import processExamination from './process/process-examination/process-examination';
// 计划管理/工单管理
import workOrderManage from './plan-manage/workorder-manage/workorder';
// 计划干预调整
import planInterpose from './plan-manage/planInterpose-manage/planInterpose';

export default {
    '/common/base-info/manpower': new manpower(),
    '/common/base-info/department': department,
    '/common/base-info/client': client,
    '/common/base-info/product-type': productType,
    '/common/base-info/job': job,
    '/common/base-info/supplier': supplier,
    '/common/base-info/factory': factory,
    '/common/base-info/equipment': equipment,
    '/common/base-info/area': area,
    '/common/base-info/line': line,
    '/common/base-info/procedure': procedure,
    '/common/sys-manage/system-field': systemField,
    '/common/sys-manage/online-user': onlineUser,
    '/common/sys-manage/task': task,
    '/common/sys-manage/privilege': privilege,
    '/common/sys-manage/log': log,
    '/common/sys-manage/Interface': interfaceInfo,
    '/common/bus-manage/product-manage': new ProductManage(),
    '/common/bus-manage/project-manage': projectManage,
    '/common/bus-manage/bom-manage': bomManage,
    '/common/bus-manage/order-manage': new orderManage(),
    '/common/process/design': new ProcessDesign(),
    '/common/process/knowledge': new ProcessKnowledge(),
    '/common/process/manage': new processCardManage(),
    '/common/process/examination':new processExamination(),
    '/common/sys-manage/set': sysSet,
    '/common/plan-manage/workorder': new workOrderManage(),
    '/common/plan-manage/plan-adjustment': new planInterpose(),
};
