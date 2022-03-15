class EmitPlugin {
  apply(compiler) {
    // 注册 emit 钩子事件
    compiler.hooks.emit.tap("EmitPlugin", () => {
      compiler.assets["README.md"] = "请先读我";
    });
  }
}

module.exports = EmitPlugin;
