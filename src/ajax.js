import defaultConfig from './module/core/config.js';
import Ajax from './module/core/Ajax.js';
import allOwnKeysAssign from './module/utils/allOwnKeysAssign.js';

// 实现无new创建实例
function createInstance(defaultConfig) {
    const context = new Ajax(defaultConfig);
    const instance = Ajax.prototype.request.bind(context);
    allOwnKeysAssign(instance, Ajax.prototype, context);
    allOwnKeysAssign(instance, context);

    instance.create = function(instanceConfig) {
        return createInstance(Object.assign(defaultConfig, instanceConfig));
    };
    return instance;
}

const ajax = createInstance(defaultConfig);

export default ajax;