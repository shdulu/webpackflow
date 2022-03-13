const colors = require("colors/safe");
class RunPlugin {
  apply(compiler) {
    // 注册 run 钩子事件
    compiler.hooks.run.tap("RunPlugin", () => {
      console.log(colors.red("触发了 RunPlugin 钩子事件"));
    });
  }
}

module.exports = RunPlugin;
