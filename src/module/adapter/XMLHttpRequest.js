import getSearchParams from "../utils/getSearchParams.js";

export default async function(config){
    return new Promise(function(resolve, reject){
        let xhr = new XMLHttpRequest();
        if(typeof config.data =='object'&&config.data instanceof FormData){
            config.method = 'POST';
        }
        for(let name in config.headers){
            xhr.setRequestHeader(name,config.headers[name]);
        }
        xhr.crossDomain = config.crossDomain;
        xhr.withCredentials = config.credentials;
        // 发送请求
        if (config.method == 'GET') {
            let patch = {};
            if(config.cache){
                patch['v'] = '_'+Date.now();
            }
            let url = config.url;
            let searchParams = getSearchParams(config.data,patch);
            if(searchParams){
                url += (url.includes('?')?'&':'?')+searchParams;
            }
            xhr.open(config.method, url, true);
            xhr.send(null);
        }else{
            xhr.open(config.method, config.url, true);
            let data = config.data;
            if(config.data instanceof FormData){
                xhr.setRequestHeader('content-type','multipart/form-data');
            }else if(typeof config.data=='object'){
                xhr.setRequestHeader('content-type','application/json');
                data = JSON.stringify(config.data);
            }else{
                xhr.setRequestHeader('content-type','application/x-www-form-urlencoded');
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