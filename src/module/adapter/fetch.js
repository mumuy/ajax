import getSearchParams from "../utils/getSearchParams.js";

export default async function(config){
    let url = config.url;
    let params = {
        credentials: 'same-origin'
    };
    let param = {};
    param.credentials = config.credentials?'include':'same-origin';
    params.headers = config.headers;
    params.cache = config.cache?'default':'no-store';
    params.mode = config.crossDomain?'cors':'no-cors';
    if(config.method=='GET'){
        let searchParams = getSearchParams(config.data);
        if(searchParams){
            url += (url.includes('?')?'&':'?')+searchParams;
        }
    }else if(config.method=='POST'){
        params.body = config.data;
        if(config.data instanceof FormData){
            params.headers['Content-Type'] = 'multipart/form-data';
        }else if(typeof config.data=='object'){
            params.headers['Content-Type'] = 'application/json';
            params.body = JSON.stringify(config.data);
        }else{
            params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
    }
    // 超时处理
    const controller = new AbortController();
    const signal = controller.signal;
    let hander = setTimeout(function() {
        controller.abort();
        config.onTimeout();
    }, config.timeout);
    return fetch(url,{
        ...params,
        signal
    }).then(function(response){
        hander && clearTimeout(hander);
        if(config.responseType=='json'){
            return response.json();
        }else{
            return response.text();
        }
    });
}