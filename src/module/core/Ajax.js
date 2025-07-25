
// 拦截器
import defaultConfig from './config.js';
import { isString } from '../utils/type.js';
import Interceptor from './interceptor.js';
import doRequest from './doRequest.js';
import CustomEventSource from './CustomEventSource.js';

class Ajax {
    constructor(instanceConfig = {}){
        // 实例默认配置
        this.defaults = Object.assign({},defaultConfig,instanceConfig);
        this.interceptors = {
            request: new Interceptor(),
            response: new Interceptor()
        };
    }
    // 通用请求方法
    async request(requestConfig,otherConfig){
        const config = {};
        // 参数规范化
        if(isString(requestConfig)){
            Object.assign(config,this.defaults,{
                url:requestConfig
            },otherConfig);
        }else{
            Object.assign(config,this.defaults,requestConfig);
        }
        if(!config.url.startsWith('http')){
            config.url = config.baseURL + config.url;
        }
        config.method = config.method.toUpperCase();
        config.responseType = config.responseType.toLowerCase();
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
    // JSONP
    async jsonp(url, data, config){
        return this.request({
            method:'GET',
            url,
            data,
            ...config,
            responseType:'jsonp'
        });
    }
    createEventSource(url,requestConfig){
        const _ = this;
        const controller = new AbortController();
        const config = Object.assign({},_.defaults,requestConfig,{
            url,
            method:'GET',
            headers: {
                'Accept': 'text/event-stream'
            },
            responseType:'stream',
            signal:controller.signal
        });
        return new CustomEventSource(function(){
            return _.request(config);
        },{
            ...config,
            controller
        });
    }
}

// 快捷方法封装
['get', 'post', 'push', 'patch'].forEach(function(method){
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