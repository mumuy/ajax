import globalThis from '../runtime/globalThis.js';
import {toQueryString} from "../utils/formatter.js";

export default async function(config){
    return new Promise(function(resolve, reject){
        // 插入动态脚本及回调函数
        let $head = document.getElementsByTagName('head')[0];
        let $script = document.createElement('script');
        $head.appendChild($script);
        $script.setAttribute('referrerPolicy','no-referrer');
        let hander = null;
        function cleanup(){
            if($script.parentNode){
                $head.removeChild($script);
            }
            delete globalThis[config.jsonpCallback];
            if(hander){
                clearTimeout(hander);
            }
        }
        // 回调处理
        globalThis[config.jsonpCallback] = function (json) {
            cleanup();
            resolve(json);
        };
        $script.onerror = function(){
            cleanup();
            reject(new Error('jsonp load error'));
        };
        // 发送请求
        let patch = {};
        if(!config.cache){
            patch['v'] = '_'+Date.now();
        }
        patch[config.jsonp] = config.jsonpCallback;
        let queryString = toQueryString(config.data,patch);
        if(queryString){
            config.url += (config.url.includes('?')?'&':'?')+queryString;
        }
        $script.src = config.url;
        // 超时处理
        hander = setTimeout(function(){
            cleanup();
            config.onTimeout();
            reject(new Error('timeout'));
        }, config.timeout);
    });
}