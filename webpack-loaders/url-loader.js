/**
 * url-loader 其实是基于file-loader
 * 如果文件大小高于阀值，走file-loader
 * 如果文件大小低于阀值，变成base64字符串
 */
const colors = require("colors/safe");
const mime = require("mime");
const { getOptions } = require("loader-utils");

function loader(content) {
  const options = getOptions(this) || {};
  console.log(colors.yellow("url-loader", options));
  let { limit, fallback = "file-loader" } = options;
  if (limit) {
    limit = parseInt(limit, 10);
  }
  if (!limit || content.length < limit) {
    const mimeType = mime.getType(this.resourcePath);
    let base64Str =
      "data:" + mimeType + ";base64," + content.toString("base64");
    return `module.exports=${JSON.stringify(base64Str)}`;
  } else {
    let fileLoader = require(fallback || "file-loader");
    return fileLoader.call(this, content);
  }
}
loader.raw = true;

module.exports = loader;
