export default class ParseEventStream {
    constructor(data) {
        this.listeners = new Map();
        this._parseEventStream(data);
    }
    // 解析SSE流数据
    _parseEventStream(data) {
        const events = data.split('\n\n');
        events.forEach(event => {
            if (event.trim() === '') return;
            const lines = event.split('\n');
            let eventType = 'message';
            let eventData = '';
            lines.forEach(line => {
                if (line.startsWith('event:')) {
                    eventType = line.substring(6).trim();
                } else if (line.startsWith('data:')) {
                    eventData += line.substring(5).trim() + '\n';
                }
            });
            // 触发事件监听器
            if (this.listeners.has(eventType)) {
                this.listeners.get(eventType).forEach(listener => {
                    listener({ type: eventType, data: eventData.trim() });
                });
            }
        });
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
}