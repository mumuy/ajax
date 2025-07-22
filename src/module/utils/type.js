export function isObject(value){
    return value != null && (typeof value == 'object' || typeof value == 'function');
}

export function isNumber(value){
    return typeof value==='number'&&!isNaN(value);
}

export function isString(value){
    return (typeof value=='string');
}

export function isArray(value){
    return Array.isArray(value);
}

export function isFormData(value){
    return value instanceof FormData;
}

export function isArrayBufferView(value) {
    return (
        value instanceof Int8Array ||
        value instanceof Uint8Array ||
        value instanceof Uint8ClampedArray ||
        value instanceof Int16Array ||
        value instanceof Uint16Array ||
        value instanceof Int32Array ||
        value instanceof Uint32Array ||
        value instanceof Float32Array ||
        value instanceof Float64Array ||
        value instanceof DataView
    );
}

export function isURLSearchParams(value){
    return value instanceof URLSearchParams;
}

export function isXML(value){
    return (typeof value === 'string' && /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/i.test(value));
}