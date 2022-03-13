const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const RunPlugin = require("./plugins/run-plugin");
const DonePlugin = require("./plugins/done-plugin");
module.exports = {
  mode: "development",
  devtool: false,
  entry: {
    entry1: "./src/index.js",
    entry2: "./src/entry2.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          // 自定义loader的绝对路径
          path.resolve(__dirname, "loaders", "logger1-loader.js"),
          path.resolve(__dirname, "loaders", "logger2-loader.js"),
        ],
      },
    ],
  },
  plugins: [
    new RunPlugin(),
    // new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ["**/*"] }),
    // new HtmlWebpackPlugin({
    //   template: "./public/index.html",
    //   filename: "index.html",
    // }),
    new DonePlugin(),
  ],
  devServer: {},
};
