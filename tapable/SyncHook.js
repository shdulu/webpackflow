const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

class SyncHookCodeFactory extends HookCodeFactory {
  // 每个钩子代码工厂内容都不一样
  content() {
    return this.callTapsSeries(); // 同步钩子
  }
}
let factory = new SyncHookCodeFactory();

class SyncHook extends Hook {
  compile(options) {
    factory.setup(this, options);
    // 返回就是我们懒编译的call方法
    return factory.create(options);
  }
}

module.exports = SyncHook;
