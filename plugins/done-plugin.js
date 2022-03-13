class DonePlugin {
  apply(compiler) {
    // 挂载阶段
    // 注册 done 钩子事件
    compiler.hooks.done.tap("DonePlugin", () => {
      // 执行阶段
      console.log("触发了 DonePlugin 钩子事件");
    });
  }
}

module.exports = DonePlugin;
