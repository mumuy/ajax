import { isFormData, isObject, isArrayBufferView, isString} from '../utils/type.js';
import { toQueryString, toBracketsQueryString } from '../utils/formatter.js';

export default function(data, headers, dataFormatter){
    if(!headers['Content-Type']){
        if(isFormData(data)){
            headers['Content-Type'] = 'multipart/form-data';
        }else if(data instanceof URLSearchParams){
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }else if(isArrayBufferView(data)){
            headers['Content-Type'] = 'application/octet-stream';
        }else if(isObject(data)){
            headers['Content-Type'] = 'application/json';
        }else{
            headers['Content-Type'] = 'text/plain';
        }
    }
    if(dataFormatter){
        if(isObject(dataFormatter)){
            if(headers['Content-Type'].includes('application/x-www-form-urlencoded')){
                return dataFormatter.arrayFormat=='brackets'?toBracketsQueryString(data):toQueryString(data);
            }
        }else{
            return dataFormatter(data, headers);
        }
    }
    if(headers['Content-Type'].includes('application/json')){
        return JSON.stringify(config.data);
    }else if(headers['Content-Type'].includes('application/x-www-form-urlencoded')){
        return toQueryString(data);
    }
    return data;
}