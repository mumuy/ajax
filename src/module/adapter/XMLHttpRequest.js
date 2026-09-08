import transformRequest from "../core/transformRequest.js";
import { isFormData } from '../utils/type.js';
import { toQueryString } from "../utils/formatter.js";

export default async function(config){
    return new Promise(function(resolve, reject){
        let xhr = new XMLHttpRequest();
        if(isFormData(config.data)){
            config.method = 'POST';
        }
        xhr.withCredentials = config.withCredentials;
        if(['arraybuffer','blob','document'].includes(config.responseType)){
            xhr.responseType = config.responseType;
        }
        // 发送请求
        if (config.method == 'GET') {
            let patch = {};
            if(!config.cache){
                patch['v'] = '_'+Date.now();
            }
            let url = config.url;
            let queryString = toQueryString(config.data,patch);
            if(queryString){
                url += (url.includes('?')?'&':'?')+queryString;
            }
            xhr.open(config.method, url, true);
            for(let name in config.headers){
                xhr.setRequestHeader(name,config.headers[name]);
            }
            xhr.send(null);
        }else{
            xhr.open(config.method, config.url, true);
            const data = transformRequest(config.data, config.headers, config.dataFormatter);
            for(let name in config.headers){
                xhr.setRequestHeader(name,config.headers[name]);
            }
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
                    let data = config.responseType == "xml" ? xhr.responseXML : (xhr.responseType ? xhr.response : xhr.responseText);
                    if (config.responseType == "json") {
                        if(xhr.status == 204){
                            resolve(null);
                            return;
                        }
                        try{
                            data = JSON.parse(data);
                        }catch(error){
                            reject(error);
                            return;
                        }
                    }
                    resolve(data);
                } else {
                    const error = new Error(xhr.response || ('HTTP '+xhr.status));
                    error.status = xhr.status;
                    reject(error);
                }
                hander && clearTimeout(hander);
            }
        });
    });
}