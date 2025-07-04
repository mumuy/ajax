export default function(param){
    let config = Object.assign({
        method:'GET',                               // 请求方法
        url:location.origin,                        // 请求地址
        data:{},                                    // 请求参数
        dataType:'json',                            // 响应数据格式
        headers: {},                                // 请求头设置
        crossDomain:false,                          // 是否跨域
        credentials:false,                          // 允许客户端发送凭证
        cache:true,                                 // 是否设置缓存
        timeout:5000,                               // 超时时间
        jsonp: 'callback',                          // jsonp回调函数引用
        jsonpCallback: 'jsonp_' + Date.now(),       // jsonp回调函数名称
        onTimeout:function(){},
    },param);
    config.method = config.method.toUpperCase();
    config.dataType = config.dataType.toLowerCase();
    return config;
}