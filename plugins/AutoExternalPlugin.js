const { ExternalModule } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

/**
 * 1. webpack有哪些种模块，模块的类型有什么区别？
 * 2. external 配置后有什么用？它是如何生效的
 * 3. 需要知道，我的项目中有没有引jquery？如果引入就得把cdn的url地址插入页面中
 *
 *  webpack里有哪些对象
 *  webpack有哪些环境
 *  打包过程有哪些步骤
 *  那个环节有哪些钩子
 * node --inspect-brk ./node_modules/webpack-cli/bin/cli.js  chrome 调试webpack
 * @class AutoExternalPlugin
 */
class AutoExternalPlugin {
  constructor(options) {
    this.options = options;
    this.importedModules = new Set(); // 放着所有的导入的并依赖的模块
    this.externalModules = Object.keys(this.options);
  }
  apply(compiler) {
    // 获取普通模块工厂
    compiler.hooks.normalModuleFactory.tap(
      "AutoExternalPlugin",
      (normalModuleFactory) => {
        // 获取js模块的parser
        normalModuleFactory.hooks.parser
          .for("javascript/auto")
          .tap("AutoExternalPlugin", (parser) => {
            // 如果真的导入一个任何一个模块的话，都会添加到 importedModules
            parser.hooks.import.tap(
              "AutoExternalPlugin",
              (statement, source) => {
                if (this.externalModules.includes(source)) {
                  this.importedModules.add(source);
                }
              }
            );
            parser.hooks.call
              .for("require")
              .tap("AutoExternalPlugin", (expression) => {
                let value = expression.arguments[0].value;
                if (this.externalModules.includes(value)) {
                  this.importedModules.add(value);
                }
              });
          });
        // 这个真正用来生产模块的钩子
        normalModuleFactory.hooks.factorize.tapAsync(
          "AutoExternalPlugin",
          (resolveData, callback) => {
            let request = resolveData.request; // 将要加载的资源 ./src/index.js
            if (this.externalModules.includes(request)) {
              let variable = this.options[request].expose;
              callback(null, new ExternalModule(variable, "window", request));
            } else {
              callback(null);
            }
          }
        );
      }
    );
    compiler.hooks.compilation.tap("AutoExternalPlugin", (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
        "AutoExternalPlugin",
        (htmlData, callback) => {
          const { assetTags } = htmlData;
          let importedExternalModules = Object.keys(this.options).filter(
            (item) => this.importedModules.has(item)
          );
          importedExternalModules.forEach((key) => {
            assetTags.scripts.unshift({
              tagName: "script",
              voidTag: false,
              attributes: {
                src: this.options[key].url,
                defer: false,
              },
            });
          });
          callback(null, htmlData);
        }
      );
    });
  }
}
module.exports = AutoExternalPlugin;
