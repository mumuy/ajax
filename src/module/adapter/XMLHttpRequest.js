import { isFormData } from '../utils/type.js';
import { toQueryString } from "../utils/formatter.js";

export default async function(config){
    return new Promise(function(resolve, reject){
        let xhr = new XMLHttpRequest();
        if(isFormData(config.data)){
            config.method = 'POST';
        }
        for(let name in config.headers){
            xhr.setRequestHeader(name,config.headers[name]);
        }
        xhr.crossDomain = config.crossDomain;
        xhr.withCredentials = config.withCredentials;
        // 发送请求
        if (config.method == 'GET') {
            let patch = {};
            if(config.cache){
                patch['v'] = '_'+Date.now();
            }
            let url = config.url;
            let queryString = toQueryString(config.data,patch);
            if(queryString){
                url += (url.includes('?')?'&':'?')+queryString;
            }
            xhr.open(config.method, url, true);
            xhr.send(null);
        }else{
            xhr.open(config.method, config.url, true);
            const data = transformRequest(config.data, config.headers, config.dataFormatter);
            xhr.setRequestHeader('Content-Type', config.headers['Content-Type']);
            xhr.send(data);
        }
        // 超时处理
        let requestDone = false;
        let hander = setTimeout(function() {
            requestDone = true;
            if(xhr.readyState != 4){
                xhr.abort();
                config.onTimeout();
                reject(new Error('timeout'));
            }
        }, config.timeout);
        // 状态处理
        xhr.addEventListener('loadend',() => {
            if(!requestDone){
                if(xhr.status>=200 && xhr.status<300||xhr.status == 304) {
                    let data = config.responseType == "xml" ? xhr.responseXML : xhr.responseText;
                    if (config.responseType == "json") {
                        data =  JSON.parse(data);
                    }
                    resolve(data);
                } else {
                    reject(new Error(xhr.response));
                }
                hander && clearTimeout(hander);
            }
        });
    });
}