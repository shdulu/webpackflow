const { AsyncSeriesHook } = require("tapable");

const QUEUED_STATE = 0; // 已经入队，待执行
const PROCESSING_STATE = 1; // 处理中
const DONE_STATE = 2; // 处理完成

class AsyncQueueEntry {
  constructor(item, callback) {
    this.item = item;
    this.state = QUEUED_STATE;
    this.callback = callback;
  }
}
class AsyncQueue {
  constructor({ name, parallelism, processor, getKey }) {
    this._name = name; // 队列的名字
    this._parallelism = parallelism; // 并发执行的任务
    this._processor = processor; // 针对队列中的每个条目执行什么操作
    this._getKey = getKey; // 函数，返回一个key用来唯一标识
    this._entries = new Map();
    this._queued = new ArrayQueue();
    this._activeTasks = 0;
    this._willEnsureProcessing = false;
    this.hooks = {
      beforeAd: new AsyncSeriesHook(["item"]),
    };
  }

  add = (item, callback) => {
    const key = this._getKey(item);
    const entry = this._entries.get(key);
    const newEntry = new AsyncQueueEntry(item, callback);
    this._entries.set(key, newEntry);
    this._queued.enqueue(newEntry); // 把这个新条目放入队列
    if (this._willEnsureProcessing === false) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing); // 把这个变成异步执行
    }
  };
  _ensureProcessing = () => {
    // 如果当前激活的或者正在执行任务数小于并发数
    while (this._activeTasks < this._parallelism) {
      const entry = this._queued.dequeue(); // 出队
      if (entry === undefined) break;
      this._activeTasks++;
      entry.state = PROCESSING_STATE;
      this._startProcessing(entry);
    }
    this._willEnsureProcessing = false;
  };
  _startProcessing = (entry) => {
    this._processor(entry.item, (e, r) => {
      this._handleResult(entry, e, r);
    });
  };
  _handleResult = (entry, error, result) => {
    const callback = entry.callback;
    entry.state = DONE_STATE;
    entry.callback = undefined;
    entry.result = result;
    entry.error = error;
    callback(error, result);
    this._activeTasks--;
    if (this._willEnsureProcessing === false) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing); // 把这个变成异步执行
    }
  };
}
class ArrayQueue {
  constructor() {
    this._list = [];
  }
  enqueue(item) {
    this._list.push(item);
  }
  dequeue() {
    return this._list.shift();
  }
}

module.exports = AsyncQueue;
