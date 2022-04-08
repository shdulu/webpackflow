const colors = require("colors/safe");
class HashPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.compilation.tap("HashPlugin", (compilation, params) => {
      // 如果想改变hash值，可以在hash改变生成之后修改
      compilation.hooks.afterHash.tap("HashPlugin", () => {
        let tsHash = Date.now() + "";
        console.log(
          colors.red("本次编译的compilation.hash:"),
          compilation.hash
        );
        compilation.hash = tsHash; // 改变hash
        for (let chunk of compilation.chunks) {
          console.log(colors.red("本次编译的chunk.hash:"), chunk.hash);
          chunk.renderedHash = "chunkHash"; // 改变chunk hash
          console.log(
            colors.red("本次编译的chunk.contentHash:"),
            chunk.contentHash
          );
          chunk.contentHash = {
            javascript: "contentHash",
          };
        }
      });
    });
  }
}
module.exports = HashPlugin;
