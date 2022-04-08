const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const RunPlugin = require("./plugins/run-plugin");
const EmitPlugin = require("./plugins/emit-plugin");
const DonePlugin = require("./plugins/done-plugin");
const AssetPlugin = require("./plugins/AssetPlugin");
const ZipPlugin = require("./plugins/ZipPlugin");
const HashPlugin = require("./plugins/HashPlugin");
module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, "webpack-loaders"), "node_modules"],
  },
  module: {
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
  ],
  devServer: {},
};
