export default {
    baseURL:location.origin,                    // 基础域
    method:'GET',                               // 请求方法
    url:'',                                     // 请求地址
    data:{},                                    // 请求参数
    headers:{},                                 // 请求头设置
    withCredentials:false,                      // 是否携带凭证
    crossDomain:false,                          // 是否跨域
    cache:true,                                 // 是否设置缓存
    timeout:5000,                               // 超时时间
    jsonp:'callback',                           // jsonp回调函数引用
    jsonpCallback: 'jsonp_' + Date.now(),       // jsonp回调函数名称
    responseType:'json',                        // 响应数据格式
    dataFormatter:null,                         // 数据格式化处理
    retryCount:3,                               // 重试次数
    onTimeout:function(){},                     // 超时处理
}