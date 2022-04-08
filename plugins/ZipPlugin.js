/**
 * 我要把这些所有产出的文件都打在一个压缩包
 * 1. 知道本次编译产出了那些文件
 * 2. 如何向输出结果里添加新的文件
 *
 * @class ZipPlugin
 */
const JSZip = require("jszip");
const path = require("path");
const { RawSource } = require("webpack-sources");
class ZipPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    
    compiler.hooks.compilation.tap("ZipPlugin", (compilation) => {
      // 当确定好文件，当你处理每个资源的时候处执行 
      compilation.hooks.processAssets.tapAsync(
        "ZipPlugin",
        (assets, callback) => {
          let zip = new JSZip();
          for (const filename in assets) {
            // Source 类的实例，source方法可以返回真正的源码
            let source = assets[filename].source();
            zip.file(filename, source);
          }
          zip.generateAsync({ type: "nodebuffer" }).then((zipContent) => {
            assets[this.options.filename.replace("[timestamp]", Date.now())] =
              new RawSource(zipContent);
            callback();
          });
        }
      );
    });
  }
}

module.exports = ZipPlugin;
