const colors = require("colors/safe");
const { getOptions, interpolateName } = require("loader-utils");
/**
 *
 * @param {*} content 文件内容 buffer
 * @return {*}
 */
function loader(content) {
  const options = getOptions(this) || {};
  // 这里不知道为什么取不到 options
  // 生成打包后输出的文件名
  const filename = interpolateName(this, options.filename, {
    content,
  });
  this.emitFile(filename, content);
  return `module.exports = ${JSON.stringify(filename)}`;
}
loader.raw = true;

module.exports = loader;
