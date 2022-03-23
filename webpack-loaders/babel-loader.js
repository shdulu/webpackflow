const colors = require("colors/safe");
const babelCode = require("@babel/core");
const path = require("path");
const { getOptions } = require("loader-utils");

/**
 * 根据老代码生成新代码
 *
 * @param {*} source
 * @return {*}
 */
function loader(source, inputSourceMap, data) {
  let filename = this.resourcePath.split(path.sep).pop();
  let options = getOptions(this) || {};
  console.log('babel-loader', options)
  let loaderOptions = {
    ...options,
    sourceMaps: true, //我会基于上一个份sourcemap生成自己的sourcemap
    filename,
    inputSourceMap,
  };

  let { code, map, ast } = babelCode.transformSync(source, loaderOptions);
  // 如果想给下一个loader返回多个值的话，使用callback
  this.callback(null, code, map, ast);
}

module.exports = loader;
