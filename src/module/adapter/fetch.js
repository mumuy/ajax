import transformRequest from "../core/transformRequest.js";
import {toQueryString} from "../utils/formatter.js";

export default async function(config){
    let url = config.url;
    const params = {
        method:config.method,
        credentials:'omit',
        headers:config.headers,
        cache:config.cache?'default':'no-store',
        mode:config.crossDomain?'cors':'no-cors'
    };
    if(config.withCredentials){
        params.credentials = config.crossDomain?'include':'same-origin';
    }
    if(config.method=='GET'){
        let queryString = toQueryString(config.data);
        if(queryString){
            url += (url.includes('?')?'&':'?')+queryString;
        }
    }else if(config.method=='POST'){
        params.body = transformRequest(config.data, params.headers, config.dataFormatter);
    }
    // 超时处理
    let hander = setTimeout(function() {
        config.onTimeout();
    }, config.timeout);
    // 发起请求
    return fetch(url,params).then(function(response){
        hander && clearTimeout(hander);
        if(config.responseType=='stream'){
            return response.body;
        }else if(config.responseType=='json'&&response.json){
            return response.json();
        }else if(config.responseType=='text'&&response.text){
            return response.text();
        }else{
            return response.blob();
        }
    });
}