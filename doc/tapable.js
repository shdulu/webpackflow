let { SyncHook } = require("tapable");

let hook = new SyncHook();

hook.tap("cb1", () => {
  console.log("cb1");
});
hook.tap("cb2", () => {
  console.log("cb2");
});
hook.tap("cb3", () => {
  console.log("cb3");
});

hook.call();

// 发布订阅
class MySyncHook {
  constructor() {
    this.taps = [];
  }
  tap(name, fn) {
    // 注册事件
    this.taps.push(fn);
  }
  call() {
    // 触发
    this.taps.forEach((tap) => tap());
  }
}

const myHook = new MySyncHook()

myHook.tap('call1', () => {
  console.log('call1')
})

myHook.call()