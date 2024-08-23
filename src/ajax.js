import getConfig from './module/utils/getConfig.js';
import XMLHttpRequest_adapter from './module/adapter/XMLHttpRequest.js';
import fetch_adapter from './module/adapter/fetch.js';
import jsonp_adapter from './module/adapter/jsonp.js';

async function ajax(param){
    let config = getConfig(param);
    if(config.dataType=='jsonp'){
        return jsonp_adapter(config);
    }else if(typeof XMLHttpRequest != 'undefined'){
        return XMLHttpRequest_adapter(config);
    }else if(typeof fetch != 'undefined'){
        return fetch_adapter(config);
    }else{
        return Promise.resolve(new Error('fail'));
    }
}

ajax.get = async function(url,data,dataType='json'){
    return ajax({
        method:'GET',
        url,
        data,
        dataType
    })
};

ajax.post = async function(url,data){
    return ajax({
        method:'POST',
        url,
        data
    })
};

export default ajax;