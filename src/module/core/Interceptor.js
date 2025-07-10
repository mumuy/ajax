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
    remove(id){
        if (this.handlers[id]) {
            this.handlers[id] = null;
        }
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