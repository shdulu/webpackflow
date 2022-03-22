const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const RunPlugin = require("./plugins/run-plugin");
const EmitPlugin = require("./plugins/emit-plugin");
const DonePlugin = require("./plugins/done-plugin");
module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  resolveLoader: {
    alias: {
      "babel-loader1": path.resolve(
        __dirname,
        "webpack-loaders/babel-loader1.js"
      ),
    },
    modules: [path.resolve(__dirname, "webpack-loaders"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          // 自定义loader的绝对路径
          {
            loader: "babel-loader1",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new RunPlugin(),
    // new EmitPlugin(),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ["**/*"] }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
    }),
    new DonePlugin(),
  ],
  devServer: {},
};
