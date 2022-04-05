const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

class AsyncSeriesHookCodeFactory extends HookCodeFactory {
  // 每个钩子代码工厂内容都不一样
  content({ onDone }) {
    return this.callTapsSeries({ onDone }); // 同步钩子
  }
}
let factory = new AsyncSeriesHookCodeFactory();

class AsyncSeriesHook extends Hook {
  compile(options) {
    factory.setup(this, options);
    // 返回就是我们懒编译的call方法
    return factory.create(options);
  }
}

module.exports = AsyncSeriesHook;

/**
 * 不同的钩子到底最核心 差异实现在哪里
 * sync
 * async
 * promise
 * 
 * 
 * */  