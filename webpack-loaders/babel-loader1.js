const colors = require("colors/safe");
const babelCode = require("@babel/core");
const { getOptions } = require("loader-utils");
const { toUnixPath } = require("../utils");

/**
 * 根据老代码生成新代码
 *
 * @param {*} source
 * @return {*}
 */
function loader(source, inputSourceMap, data) {
  let options = getOptions(this) || {};
  options.sourceMaps = true; // 生成 sourceMap
  options.inputSourceMap = inputSourceMap; // 把前一个loader传过来的sourceMap 接着往下传

  const request = toUnixPath(this.request)
  console.log(colors.grey("request:", request));
  // 处理不同系统斜杠问题
  options.filename = request.split("!").pop().split("/").pop();
  let { code, map, ast } = babelCode.transform(source, options);
  // 如果想给下一个loader返回多个值的话，使用callback
  this.callback(null, code, map, ast);
}

module.exports = loader;
