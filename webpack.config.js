const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const RunPlugin = require("./plugins/run-plugin");
const EmitPlugin = require("./plugins/emit-plugin");
const DonePlugin = require("./plugins/done-plugin");
const AssetPlugin = require("./plugins/AssetPlugin");
const ZipPlugin = require("./plugins/ZipPlugin");
const HashPlugin = require("./plugins/HashPlugin");
const AutoExternalPlugin = require("./plugins/AutoExternalPlugin");
const webpack = require("webpack");
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");
const smw = new SpeedMeasureWebpackPlugin();

module.exports = smw.wrap({
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
    alias: {
      "@": path.resolve("./src"),
    },
    // module: ['node_modules']
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, "webpack-loaders"), "node_modules"],
  },
  module: {
    // 如果使用noParse 的话 juqery 里面不能在使用 require imprort 引用依赖
    // noParse: /jquery|lodash/,
    rules: [
      {
        test: /\.(jpg|png|gif|bmp)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              filename: "[name][hash:8].[ext]",
              limit: 10 * 1028,
              fallback: path.resolve(
                __dirname,
                "webpack-loaders/file-loader.js"
              ),
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "less-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  stats: 'verbose',
  plugins: [
    new AssetPlugin(),
    new ZipPlugin({
      filename: "assets_[timestamp].zip",
    }),
    new RunPlugin(),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ["**/*"] }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
    }),
    new DonePlugin(),
    new HashPlugin(),
    new AutoExternalPlugin({
      jquery: {
        // 当打包jquery的时候，会自动引入 window.jQuery
        expose: "jQuery",
        // 在生成html文件的时候，会自动向产出的html文件时引入一个外链js
        url: "https://cdn.bootcss.com/jquery/3.1.0/jquery.js",
      },
      lodash: {
        expose: "_",
        url: "https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.js",
      },
    }),
    // new FriendlyErrorsWebpackPlugin(),
    new webpack.IgnorePlugin({
      contextRegExp: /moment$/,
      resourceRegExp: /^\.\/locale/,
    }),
    // 1.1 参数匹配引入模块路径的正则表达式
    // 2.2 参数是匹配模块的对应的上下文目录
  ],
  devServer: {},
});
