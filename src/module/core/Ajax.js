
// 拦截器
import Interceptor from './interceptor.js';
import doRequest from './doRequest.js';

class Ajax {
    constructor(instanceConfig){
        // 实例默认配置
        this.defaults = instanceConfig;
        this.interceptors = {
            request: new Interceptor(),
            response: new Interceptor()
        };
    }
    // 通用请求方法
    async request(requestConfig,otherConfig){
        const config = {};
        // 参数规范化
        if(typeof requestConfig == 'string'){
            Object.assign(config,this.defaults,{
                url:requestConfig
            },otherConfig);
        }else{
            Object.assign(config,this.defaults,requestConfig);
        }
        if(config.url.indexOf('http')!==0){
            config.url = config.baseURL + config.url;
        }
        config.method = config.method.toUpperCase();
        config.dataType = config.dataType.toLowerCase();
        // 请求拦截器队列处理
        const requestInterceptorChain = [];
        this.interceptors.request.forEach(function(interceptor) {
            requestInterceptorChain.unshift(interceptor.resolved, interceptor.rejected);
        });
        // 响应拦截器队列处理
        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function(interceptor) {
            responseInterceptorChain.push(interceptor.resolved, interceptor.rejected);
        });
        // 队列处理
        const taskChain = [doRequest.bind(this),undefined];
        taskChain.unshift(...requestInterceptorChain); 
        taskChain.push(...responseInterceptorChain);
        let i = 0;
        let len = taskChain.length;
        let promise = Promise.resolve(config);
        while (i < len) {
            promise = promise.then(taskChain[i++], taskChain[i++]);
        }
        return promise;
    }
}

// 快捷方法封装
['get', 'post','head', 'options'].forEach(function(method){
    Ajax.prototype[method] = function(url, data, config) {
        return this.request({
            method,
            url,
            data,
            ...config
        });
    };
});
['delete', 'head', 'options'].forEach(function(method){
    Ajax.prototype[method] = function(url, config) {
        return this.request({
            method,
            url,
            data:null,
            ...config
        });
    };
});

export default Ajax;