import { isFormData, isObject, isArrayBufferView, isURLSearchParams, isXML, isString} from '../utils/type.js';
import { toQueryString, toBracketsQueryString, toXML } from '../utils/formatter.js';

export default function(data, headers, dataFormatter){
    if(!headers['Content-Type']){
        if(isFormData(data)){
            headers['Content-Type'] = 'multipart/form-data';
        }else if(isURLSearchParams(data)){
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }else if(isArrayBufferView(data)){
            headers['Content-Type'] = 'application/octet-stream';
        }else if(isObject(data)){
            headers['Content-Type'] = 'application/json';
        }else if(isXML(data)){
            headers['Content-Type'] = 'application/xml';
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
    if(headers['Content-Type'].includes('application/json')&&isObject(data)){
        return JSON.stringify(config.data);
    }else if(headers['Content-Type'].includes('application/x-www-form-urlencoded')&&isObject(data)){
        return toQueryString(data);
    }else if(headers['Content-Type'].includes('application/xml')&&isString(data)){
        return toXML(data);
    }
    return data;
}