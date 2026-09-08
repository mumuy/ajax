export default class CustomEventSource {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSED = 2;
    #listeners = new Map();
    #controller = null;
    #createRequest = null;
    #config = null;
    #lastEventId = null;
    #retryDelay = 3000;
    #timer = null;
    constructor(createRequest,config) {
        const _ = this;
        _.url = config.url;
        _.withCredentials = config.withCredentials||false;
        _.readyState = CustomEventSource.CONNECTING;
        _.onopen = function(){};
        _.onmessage = function(){};
        _.onerror = function(){};
        _.#controller = config.controller;
        _.#createRequest = createRequest;
        _.#config = config;
        _.#connect();
    }
    // 发起连接（含断线重连）
    async #connect() {
        const _ = this;
        if(_.readyState === CustomEventSource.CLOSED){
            return;
        }
        try{
            // 断线重连时携带 Last-Event-ID
            if(_.#lastEventId && _.#config.headers){
                _.#config.headers['Last-Event-ID'] = _.#lastEventId;
            }
            const data = await _.#createRequest();
            _.dispatchEvent({type:'open'});
            await _.#parseEventStream(data);
        }catch(error){
            if(_.readyState === CustomEventSource.CLOSED){
                return;
            }
            _.readyState = CustomEventSource.CONNECTING;
            _.dispatchEvent({type:'error',error});
            _.#scheduleReconnect();
        }
    }
    // 按 retry 字段调度重连
    #scheduleReconnect(){
        const _ = this;
        if(_.readyState === CustomEventSource.CLOSED || _.#timer){
            return;
        }
        _.#timer = setTimeout(function(){
            _.#timer = null;
            _.#connect();
        }, _.#retryDelay);
    }
    // 解析SSE流数据
    async #parseEventStream(body) {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const _ = this;
        try {
            while (true) {
                this.readyState = CustomEventSource.OPEN;
                const { done, value } = await reader.read();
                if (done) {
                    this.readyState = CustomEventSource.CONNECTING;
                    _.dispatchEvent({type:'error',msg:''});
                    break;
                }
                if (this.readyState === CustomEventSource.CLOSED){
                    break;
                }
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                // 按空行分割事件（EventStream 格式）
                const events = buffer.split('\n\n');
                buffer = events.pop() || '';  // 保留最后一个不完整的事件
                events.forEach(eventStr => {
                    if (eventStr.trim()) {
                        const event = { type: 'message', data: '', id: null, retry: null };
                        const lines = eventStr.split('\n');
                        lines.forEach(line => {
                            if (!line.trim() || line.startsWith(':')) return;
                            const [key, ...valueParts] = line.split(':');
                            const value = valueParts.join(':').trimStart();
                            switch (key) {
                                case 'event':
                                    event.type = value;
                                    break;
                                case 'data':
                                    event.data += (event.data ? '\n' : '') + (value || ''); // 拼接多行 data
                                    break;
                                case 'id':
                                    event.id = value;
                                    break;
                                case 'retry':
                                    event.retry = parseInt(value, 10); // 转换为数字
                                    if(!isNaN(event.retry) && event.retry > 0){
                                        _.#retryDelay = event.retry;
                                    }
                                    break;
                            }
                        });
                        if (event.data) {
                            event.data = event.data.replace(/\n$/, '');  // 移除最后一个换行符
                            if(event.id){
                                _.#lastEventId = event.id;
                            }
                            _.dispatchEvent(event);
                        }
                    }
                });
            }
            _.#scheduleReconnect();
        } catch(error) {
            if(_.readyState === CustomEventSource.CLOSED){
                return;
            }
            _.dispatchEvent({ type:'error', error });
            _.#scheduleReconnect();
        } finally {
            reader.releaseLock();
        }
    }
    // 分发事件到对应的回调
    dispatchEvent(event) {
        if (this.#listeners.has(event.type)&&this.readyState !== CustomEventSource.CLOSED) {
            this.#listeners.get(event.type).forEach(listener => {
                listener(event);
            });
        }
        if(this['on'+event.type]){
            this['on'+event.type](event);
        }
    }
    // 添加事件监听器
    addEventListener(eventType, callback) {
        if (!this.#listeners.has(eventType)) {
            this.#listeners.set(eventType, []);
        }
        this.#listeners.get(eventType).push(callback);
        return this;
    }
    // 移除事件监听器
    removeEventListener(eventType, callback) {
        if (this.#listeners.has(eventType)) {
            this.#listeners.set(
                eventType,
                this.#listeners.get(eventType).filter(listener => listener !== callback)
            );
        }
        return this;
    }
    close(){
        if(this.readyState === CustomEventSource.CLOSED){
            return;
        }
        this.readyState = CustomEventSource.CLOSED;
        if(this.#timer){
            clearTimeout(this.#timer);
            this.#timer = null;
        }
        if(this.#controller){
            this.#controller.abort();
        }
        this.dispatchEvent({ type: 'error', error: new Error('Connection closed') });
    }
}