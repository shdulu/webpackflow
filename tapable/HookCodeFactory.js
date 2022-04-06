class HookCodeFactory {
  // 就是把事件函数变成数组赋值给hook实例的 _x 属性
  setup(hookInstance, options) {
    hookInstance._x = options.taps.map((tapInfo) => tapInfo.fn);
  }
  args(options = {}) {
    // before 在原始参数之前增加的参数
    // after 在原始参数之后增加的参数
    let { before, after } = options;
    let allArgs = this.options.args || [];
    if (before) allArgs = [before, ...allArgs];
    if (after) allArgs = [...allArgs, after];
    return allArgs.join(", "); // [name, age] => name, age
  }
  header() {
    let code = ``;
    code += `var _x = this._x;\n`;
    let { interceptors = [] } = this.options;
    if (interceptors.length > 0) {
      code += `var _taps = this.taps;\n`;
      code += `var _interceptors = this.interceptors;\n`;
      for (let i = 0; i < interceptors.length; i++) {
        let interceptor = interceptors[i];
        if (interceptor.call) {
          code += `_interceptors[${i}].call(${this.args()});\n`;
        }
      }
    }
    return code;
  }
  content() {
    // 每个子类的实现都不一样
  }

  // 串行函数
  callTapsSeries(config = {}) {
    const { onDone = () => "" } = config;
    let { taps } = this.options;
    if (taps.length === 0) return onDone();
    let code = "";
    let current = onDone; // _callback() current的核心 指的是当前任务完成后要干的下一个任务是什么
    for (let i = taps.length - 1; i >= 0; i--) {
      const unroll = current !== onDone && this.options.taps[i].type !== "sync";
      if (unroll) {
        code += `function _next${i}() {\n`;
        code += current();
        code += `}\n`;
        current = () => `_next${i}();\n`;
      }
      const done = current;
      const content = this.callTap(i, { onDone: done });
      current = () => content;
    }
    return code;
  }

  // 异步钩子函数 - 不同的钩子会调用不同的方法进行组合
  callTapsParallel({ onDone }) {
    let { taps } = this.options;
    let code = `var _counter = ${taps.length}\n;`;
    code += `var _done = (function() {\n${onDone()}});`;
    for (let i = 0; i < taps.length; i++) {
      const content = this.callTap(i, {
        onDone: `if(--_counter === 0) _done();`,
      }); // 获取每一个事件函数对应拼出来的代码
      code += content;
    }
    return code;
  }
  callTap(tapIndex, { onDone }) {
    let code = "";
    let { interceptors = [] } = this.options;
    if (interceptors.length > 0) {
      code += `var _tap${tapIndex} = _taps[${tapIndex}];\n`;
      for (let i = 0; i < interceptors.length; i++) {
        let interceptor = interceptors[i];
        if (interceptor.tap) {
          code += `_interceptors[${i}].tap(_tap${tapIndex});\n`;
        }
      }
    }

    code += `var _fn${tapIndex} = _x[${tapIndex}];\n`;
    let tap = this.options.taps[tapIndex];
    switch (
      tap.type // 这个钩子注册的 方式不一样，返回的代码也不一样
    ) {
      case "sync":
        code += `_fn${tapIndex}(${this.args()});\n`;
        break;
      case "async":
        code += `_fn${tapIndex}(${this.args({
          after: `function() {
          ${onDone()}
        }`,
        })});`;
        break;
      case "promise":
        code += `
          var _promise${tapIndex} = _fn${tapIndex}(${this.args()});
          _promise${tapIndex}.then((function() {
            if(--_counter === 0) _done();
          }));
        `;
        break;
      default:
        break;
    }
    return code;
  }
  create(options) {
    this.init(options);
    let fn;
    switch (this.options.type) {
      case "sync":
        fn = new Function(this.args(), this.header() + this.content());
        break;
      case "async":
        fn = new Function(
          this.args({ after: "_callback" }),
          this.header() +
            this.content({
              onDone: () => `_callback();\n`,
            })
        );
        break;
      case "promise":
        let tapsContent = this.content({
          onDone: () => `_resolve();\n`,
        });
        let content = `
          return new Promise((function(_resolve, _reject) {
            ${tapsContent}
          }));
        `;
        fn = new Function(this.args(), this.header() + content);
        break;
      default:
        break;
    }
    this.deinit();
    return fn;
  }
  init(options) {
    this.options = options;
  }
  deinit() {
    this.options = null;
  }
}
module.exports = HookCodeFactory;
