import Ajax from './module/core/Ajax.js';
import {allOwnKeysAssign} from './module/utils/tool.js';

// 实现无new创建实例
function createInstance(defaultConfig = {}) {
    const context = new Ajax(defaultConfig);
    const instance = Ajax.prototype.request.bind(context);
    allOwnKeysAssign(instance, Ajax.prototype, context);

    instance.create = function(instanceConfig) {
        return createInstance(Object.assign(defaultConfig, instanceConfig));
    };
    return instance;
}

const ajax = createInstance();

export default ajax;