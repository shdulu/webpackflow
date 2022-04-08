/**
 * compilation 插件，用来打印本次产出的代码块和文件
 *
 * @class AssetPlugin
 */
class AssetPlugin {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    // 每次编译都会产生一个compilation 对象，创建后悔触发compilation事件
    compiler.hooks.compilation.tap("AssetPlugin", (compilation) => {
      // 每次根据chunk创建一个新的文件后会触发一次chunkAsset
      compilation.hooks.chunkAsset.tap("AssetPlugin", (chunk, filename) => {
        console.log(chunk.name || chunk.id, filename);
      });
    });
  }
}
module.exports = AssetPlugin;
