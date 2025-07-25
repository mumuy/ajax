import globalThis from '../runtime/globalThis.js';
import {toQueryString} from "../utils/formatter.js";

export default async function(config){
    return new Promise(function(resolve, reject){
        // 插入动态脚本及回调函数
        let $head = document.getElementsByTagName('head')[0];
        let $script = document.createElement('script');
        $head.appendChild($script);
        if(config.responseType=='jsonp'){
            globalThis[config.jsonpCallback] = function (json) {
                $head.removeChild($script);
                delete globalThis[config.jsonpCallback];
                hander && clearTimeout(hander);
                resolve(json);
            };
        }else{
            $script.onload = function(){
                hander && clearTimeout(hander);
                resolve(json);
            };
        }
        // 发送请求
        let patch = {};
        if(config.cache){
            patch['v'] = '_'+Date.now();
        }
        if(config.responseType=='jsonp'){
            patch[config.jsonp] = config.jsonpCallback;
        }
        let queryString = toQueryString(config.data,patch);
        if(queryString){
            config.url += (config.url.includes('?')?'&':'?')+queryString;
        }
        $script.src = config.url;
        // 超时处理
        let hander = setTimeout(function(){
            $head.removeChild($script);
            delete globalThis[config.jsonpCallback];
            hander && clearTimeout(hander);
            config.onTimeout();
            reject({'msg':'timeout'});
        }, config.timeout);
    });
}