import getSearchParams from "../utils/getSearchParams.js";

export default async function(config){
    let url = config.url;
    let param = {
        credentials: 'same-origin'
    };
    param.headers = config.headers;
    param.cache = config.cache;
    param.mode = config.crossDomain?'cors':'no-cors';
    if(config.method=='GET'){
        let searchParams = getSearchParams(config.data,patch);
        if(searchParams){
            url += (url.includes('?')?'&':'?')+searchParams;
        }
    }else if(config.method=='POST'){
        param.body = config.data;
        if(config.data instanceof FormData){
            param.headers['Content-Type'] = 'multipart/form-data';
        }else if(typeof config.data=='object'){
            param.headers['Content-Type'] = 'application/json';
            param.body = JSON.stringify(config.data);
        }else{
            param.headers['Content-Type'] = 'application/x-www-form-urlencoded';
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
        ...param,
        signal
    }).then(function(response){
        hander && clearTimeout(hander);
        if(dataType=='json'){
            return response.json();
        }else{
            return response.text();
        }
    });
}