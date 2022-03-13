const webpack = require("webpack");

const options = require("./webpack.config");

const compiler = webpack(options);

debugger
compiler.run((err, stats) => {
  console.log(err);
  // stats 描述编译结果的对象
  console.log(
    stats.toJson({
      entries: true, // 入口信息
      modules: true, // 本次打包的那些模块
      chunks: true, // 代码块
      assets: true, // 产出的资源
      files: true, // 最后生成了那些文件
    })
  );
});
