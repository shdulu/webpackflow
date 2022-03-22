const colors = require("colors/safe");
const Compiler = require("./Compiler");
function webpack(options) {
  // 1. 初始化参数：从配置文件和 Shell 语句中读取并合并参数,得出最终的配置对象
  // process 当前进程 argv 参数
  const shellOptions = process.argv.slice(2).reduce((config, args) => {
    let [key, value] = args.split("=");
    config[key.slice(2)] = value;
    return config;
  }, {});
  // 合并得到最终配置对象
  const finalOptions = { ...options, ...shellOptions };
  console.log(colors.blue('1.初始化参数配置：', finalOptions));
  // 2. 用上一步得到的参数初始化 Compiler 对象
  const compiler = new Compiler(finalOptions);

  // 3. 加载所有配置的插件
  if (finalOptions.plugins && Array.isArray(finalOptions.plugins)) {
    for (const plugin of finalOptions.plugins) {
      plugin.apply(compiler); // 调用插件 apply 方法
    }
  }
  return compiler;
}

module.exports = webpack;
