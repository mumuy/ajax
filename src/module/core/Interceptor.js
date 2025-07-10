// 拦截器
class Interceptor {
    constructor() {
        this.handlers = [];
    }
    add(resolved, rejected) {
        this.handlers.push({
            resolved,
            rejected
        });
        return this.handlers.length - 1;
    }
    clear() {
        this.handlers = [];
    }
    forEach(action){
        this.handlers.forEach(function(params){
            action(params);
        });
    }
}

export default Interceptor;