<!-- \/\*[\s\S]*\*\/|\/\/.* -->
<!-- ctrl+h -> 所有注释 -->
<!-- //[\s\S]*?\n -->
<!-- /\*(.|\r\n|\n)*?\*/ -->

## 实现一个自己的 webpack， 了解 webpack 工作流

## 核心概念

- webpack 默认配置文件是 `webpack.config.js`
- entry 入口 指示 webpack 应该从那个文件开始打包，用来作为内部依赖图构建的起点
  - 在 webpack5 里，如果没有额外的配置的 haul，入口文件就是`src/index.js`
- loader
  - webpack 默认情况下只能处理和理解 JavaScript 和 json 文件
  - 如果想要引入其他类型的文件，比如 css，需要对源文件进行加载和转换，转成 JS
  - 比如说处理 css 文件['style-loader', 'css-loader']，从右向左执行的
  1.  先读出源文件 index.css
  2.  把文件内容传递给 css-loader, css-loader 可以处理 css 中的@import 和 url 语法，处理完之后会把内容传递给 style-loader
  3.  style-loader 的作用是吧 css 转换成 style 标签插入到页面中

- 如何动态设置不同环境
  - --mode 用来设置模块内的`process.env.NODE_ENV`
  - --env 用来设置webpack配置文件的函数参数
  - cross-env 用来设置node环境的 process.env.NODE_ENV
  - DefinePlugin 用来设置模块内的全局变量
