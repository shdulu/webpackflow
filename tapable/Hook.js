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
    this.interceptors = []; // 拦截器的数组
  }
  intercept(interceptor) {
    this.interceptors.push(interceptor);
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
    tapInfo = this._runRegisterInterceptors(tapInfo);
    this._insert(tapInfo);
  }
  // 注册拦截器，这个是在监听函数注册的时候执行的
  _runRegisterInterceptors(tapInfo) {
    for (let interceptor of this.interceptors) {
      if (interceptor.register) {
        let newTapInfo = interceptor.register(tapInfo);
        if (newTapInfo) {
          tapInfo = newTapInfo;
        }
      }
    }
    return tapInfo;
  }
  _insert(tapInfo) {
    this._resetComilation();
    let before;
    if (typeof tapInfo.before === "string") {
      before = new Set([tapInfo.before]);
    } else if (Array.isArray(tapInfo.before)) {
      before = new Set(tapInfo.before);
    }
    let stage = 0;
    if (typeof tapInfo.stage === "number") {
      stage = tapInfo.stage; // 如果你制定了，就可以使用这个state
    }
    let i = this.taps.length;
    while (i > 0) {
      i--;
      const x = this.taps[i];
      this.taps[i + 1] = x;
      const xState = x.stage || 0;
      if (before) {
        if (before.has(x.name)) {
          before.delete(x.name); // 如果当前名字在set时，就把名字从set中删除
          continue;
        }
        if (before.size > 0) {// 如果删除之后set长度还是大于，说明还没找到全需要放在之前的元素
          continue;
        }
      }
      if (xState > stage) {
        continue;
      }
      i++;
      break;
    }
    this.taps[i] = tapInfo;
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
      interceptors: this.interceptors, // 把拦截器里的钩子也注册或者说编织到call方法
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
