const colors = require("colors/safe");
/**
 * loader 本质是一个函数，接收原始内容，返回转换后的内容
 *
 * @param {*} source
 */
function loader(source) {
  console.log(colors.yellow("logger2-loader"));
  return source + "//logger2";
}

module.exports = loader;
