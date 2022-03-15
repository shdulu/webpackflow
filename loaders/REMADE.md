## loader

- 所谓 loader 只是一个导出为函数的 JavaScript 模块。它接收上一个 loader 产生的结果或者资源文件(resource file)作为入参。也可以用多个 loader 函数转成 loader chain
- compiler 需要得到最后一个 loader 产生的处理结果。这个处理结果应该是 String 或者 Buffer(被转换为一个 string)

### 1.1 loader 运行总体流程

webpack 原型流程图 webpackflowloader.jpg

### 1.2 loader-runner

- loader-runner 是一个执行 loader 链条的的模块
- loader 类型：
  1. pre 前置
  2. normal 正常
  3. inline 行内
  4. post 后置
- loader 执行顺序： 先从左往右，在从右往左
  贴图：loader-runner2.jpg
