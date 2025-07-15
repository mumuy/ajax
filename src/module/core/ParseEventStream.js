export default class ParseEventStream {
    constructor(data,param) {
        this.listeners = new Map();
        this._parseEventStream(data);
        this.isClose = false;
        this.controller = param.controller
    }
    // 解析SSE流数据
    async _parseEventStream(body) {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const _ = this;
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
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
                                    break;
                            }
                        });
                        if (event.data) {
                            event.data = event.data.replace(/\n$/, '');  // 移除最后一个换行符
                            _.emit(event);
                        }
                    }
                });
            }
        } finally {
            reader.releaseLock();
        }
    }
    // 分发事件到对应的回调
    emit(event) {
        try {
            if (this.listeners.has(event.type)) {
                this.listeners.get(event.type).forEach(listener => {
                    listener(event);
                });
            }
        } catch (error) {
            console.error('事件处理出错:', error);
        }
    }
    // 添加事件监听器
    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);
        return this;
    }
    // 移除事件监听器
    off(eventType, callback) {
        if (this.listeners.has(eventType)) {
            this.listeners.set(
                eventType,
                this.listeners.get(eventType).filter(listener => listener !== callback)
            );
        }
        return this;
    }
    close(){
        if(this.controller){
            this.controller.abort();
        }
        this.isClose = true;
        this.emit('close');
    };
}