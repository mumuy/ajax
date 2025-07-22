import { isObject, isArray, isString, isElement } from '../utils/type.js';

// 默认搜索参数转换
export function toQueryString(param,patch = {}){
    let data = Object.assign({},param,patch);
    return (new URLSearchParams(data)).toString();
}

// PHP搜索参数转换
export function toBracketsQueryString(obj, parentKey = ''){
    const parts = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? ` ${parentKey}[${key}]`:key ;
        if (isObject(value)) {
            // 递归处理嵌套对象
            parts.push(toBracketsQueryString(value, fullKey));
        } else if (isArray(value)) {
            // 处理数组
            value.forEach((item, index) => {
                if (item instanceof Object) {
                    parts.push(toBracketsQueryString(item, `${fullKey}[${index}]`));
                } else {
                    parts.push(`${encodeURIComponent(fullKey)}[]=${encodeURIComponent(item)}`);
                }
            });
        } else {
            // 处理普通值
            parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
        }
    }
    return parts.join('&');
}

export function toXML(value){
    if (isString(value)) {
        return new DOMParser().parseFromString(value, 'application/xml');
    } else if (isElement(value)) {
        return value;
    } else {
        return null;
    }
}