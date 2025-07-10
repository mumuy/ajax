// 异步请求示例
import XMLHttpRequest_adapter from '../adapter/XMLHttpRequest.js';
import fetch_adapter from '../adapter/fetch.js';
import jsonp_adapter from '../adapter/jsonp.js';

export default async function(config){
    // 根据环境支持情况选择适配器
    let result = null;
    if(config.responseType=='jsonp'){
        result = await jsonp_adapter(config);
    }else if(typeof fetch != 'undefined'){
        result = await fetch_adapter(config);
    }else if(typeof XMLHttpRequest != 'undefined'){
        result = await XMLHttpRequest_adapter(config);
    }else{
        result = new Error('fail');
    }
    return result;
}