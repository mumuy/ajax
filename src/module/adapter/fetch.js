import transformRequest from "../core/transformRequest.js";
import { toQueryString, toXML } from "../utils/formatter.js";

export default async function(config){
    let url = config.url;
    const controller = new AbortController();
    if(config.signal){
        if(config.signal.aborted){
            controller.abort();
        }else{
            config.signal.addEventListener('abort', function(){
                controller.abort();
            }, { once:true });
        }
    }
    const params = {
        method:config.method,
        credentials:'omit',
        headers:config.headers,
        cache:config.cache?'default':'no-store',
        mode:config.crossDomain?'cors':'same-origin',
        signal: controller.signal
    };
    if(config.withCredentials){
        params.credentials = config.crossDomain?'include':'same-origin';
    }
    if(config.method==='GET'){
        let queryString = toQueryString(config.data);
        if(queryString){
            url += (url.includes('?')?'&':'?')+queryString;
        }
    }else{
        params.body = transformRequest(config.data, params.headers, config.dataFormatter);
    }
    // 超时处理
    const hander = setTimeout(function() {
        config.onTimeout();
        controller.abort();
    }, config.timeout);
    // 发起请求
    let response;
    try{
        response = await fetch(url, params);
    }catch(error){
        clearTimeout(hander);
        throw error;
    }
    clearTimeout(hander);
    if(!response.ok){
        const error = new Error('HTTP '+response.status+' '+response.statusText);
        error.status = response.status;
        throw error;
    }
    if(response.status === 204){
        return null;
    }
    if(config.responseType=='stream'){
        return response.body;
    }else if(config.responseType=='json'&&response.json){
        return response.json();
    }else if(config.responseType=='text'&&response.text){
        return response.text();
    }else if(config.responseType=='xml'&&response.text){
        return response.text().then(toXML);
    }else{
        return response.blob();
    }
}