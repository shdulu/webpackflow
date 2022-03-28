class Hook {
  constructor(args) {
    if (!Array.isArray(args)) {
      args = [];
    }
    this.args = args; // 形参数组
    this.taps = []; // 事件函数的数组
    this.call = CALL_DELEGATE;
    this.callAsync = CALL_ASYNC_DELEGATE;
    this.promise = PROMISE_DELEGATE;
  }
  tap(options, fn) {
    this._tap("sync", options, fn);
  }
  tapAsync(options, fn) {
    this._tap("async", options, fn);
  }
  tapPromise(options, fn) {
    this._tap("promise", options, fn);
  }
  _tap(type, options, fn) {
    if (typeof options === "string") {
      options = { name: options };
    }
    let tapInfo = { ...options, type, fn };
    this._insert(tapInfo);
  }
  _insert(tapInfo) {
    // this.taps 是对象的数组 {name, type, fn}
    // this._x = [fn1, fn2, f3]
    this._resetComilation();
    this.taps.push(tapInfo);
  }
  _resetComilation() {
    this.call = CALL_DELEGATE; // 重置为原始的函数，准备重新编译
    this.callAsync = CALL_ASYNC_DELEGATE;
  }
  compile() {
    // 函数的编译工作需要交给子类去实现， 父类里这个方法是抽象方法，需要子类去覆盖
    throw new Error("Abstract: should be override");
  }
  _createCall(type) {
    return this.compile({
      taps: this.taps, // tapInfo 的数组
      args: this.args, // 形参名称的数组
      type, // 钩子类型 sync
    });
  }
}
// 核心是懒的动态编译 - 生成编译之后的call方法
const CALL_DELEGATE = function (...args) {
  this.call = this._createCall("sync"); // 动态创建call 方法
  return this.call(...args);
};
const CALL_ASYNC_DELEGATE = function (...args) {
  this.callAsync = this._createCall("async"); // 动态创建call 方法
  return this.callAsync(...args);
};
const PROMISE_DELEGATE = function (...args) {
  this.promise = this._createCall("promise"); // 动态创建call 方法
  return this.promise(...args);
};
module.exports = Hook;
