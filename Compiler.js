const path = require("path");
const fs = require("fs");
const { SyncHook } = require("tapable");
const colors = require("colors/safe");
const types = require("babel-types"); // 判断某个节点是否是某个类型，生成某个新的节点
const parser = require("@babel/parser"); // 把源代码生成AST抽象语法树
const traverse = require("@babel/traverse").default; // 遍历器遍历AST语法树
const generator = require("@babel/generator").default; // 代码生成器,根据语法树重新生成新的代码
const { toUnixPath } = require("./utils");
const { entry } = require("./webpack.config");
let rootPath = toUnixPath(process.cwd());
class Compiler {
  constructor(options) {
    this.options = options;
    rootPath = this.options.context || rootPath;
    this.hooks = {
      run: new SyncHook(), // 开启编译
      emit: new SyncHook(), // 写入文件系统
      done: new SyncHook(), // 编译工作全部完成
    };
    this.entries = new Set(); // 所有的入口模块
    this.modules = new Set(); // 所有的模块
    this.chunks = new Set(); // 所有的代码块
    this.assets = {}; // 存放本次要产出的文件
    this.files = new Set(); // 存放本次编译所有的产生的文件名
  }
  /**
   *
   *
   * @param {*} entryName 入口名称
   * @param {*} modulePath 模块路径
   */
  buildModule(entryName, modulePath) {
    // 1. 读取出来此模块的内容
    const originalSourceCode = fs.readFileSync(modulePath, "utf8");
    let targetSourceCode = originalSourceCode;
    // 2. 调用所有配置的loader对模块进行编译
    const rules = this.options.module.rules;

    // 得到本文件模块生效的loader有哪些
    let loaders = [];
    for (let i = 0; i < rules.length; i++) {
      if (modulePath.match(rules[i].test)) {
        loaders = [...loaders, ...rules[i].use];
      }
    }
    // 倒序执行loader，返回本次loader编译执行结果给下一个loader
    for (let i = loaders.length - 1; i >= 0; i--) {
      targetSourceCode = require(loaders[i])(targetSourceCode);
    }
    // 7. 再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
    // A -> B -> C 模块id都是一个相对于根目录的相对路径
    let moduleId = "./" + path.posix.relative(rootPath, modulePath);
    let module = {
      id: moduleId,
      dependencies: [],
      name: entryName,
    };
    // 找模块依赖 - 把转换后的源码转成抽象语法树
    let ast = parser.parse(targetSourceCode, { sourceType: "module" });
    traverse(ast, {
      CallExpression: ({ node }) => {
        if (node.callee.name === "require") {
          // 要引入的模块的相对路径
          let moduleName = node.arguments[0].value;
          // 1. 拿到当前模块的所在目录
          let dirName = path.posix.dirname(modulePath);
          let depModulePath = path.posix.join(dirName, moduleName);
          const extensions = this.options.resolve.extensions;
          depModulePath = tryExtensions(
            depModulePath,
            extensions,
            moduleName,
            dirName
          );
          let depModuleId = "./" + path.posix.relative(rootPath, depModulePath);
          node.arguments = [types.stringLiteral(depModuleId)];
          // 判断现有的已经编译过得modules 里面有没有这个模块，如果有，不在添加
          // TODO -
          // if (!this.modules.has(depModuleId)) {
          //   module.dependencies.push(depModulePath);
          // }
          module.dependencies.push(depModulePath);
        }
      },
    });
    let { code } = generator(ast);
    module._source = code; // 此模块的源代码
    // 把当前的模块编译完成，会找到它所有的依赖，进行递归的编译
    module.dependencies.forEach((dependency) => {
      let depModule = this.buildModule(entryName, dependency);
      this.modules.add(depModule);
    });
    return module;
  }
  run(callback) {
    this.hooks.run.call(); // 执行run的call() 方法
    // 5. 根据配置中的entry找出入口文件
    // 找到入口文件 开始真正的编译
    const entry = {};
    if (typeof this.options.entry === "string") {
      entry.main = this.options.entry;
    } else {
      entry = this.options.entry;
    }

    // 6. 从入口文件出发,调用所有配置的Loader对模块进行编译
    for (const entryName in entry) {
      const entryPath = toUnixPath(path.join(rootPath, entry[entryName]));
      console.log("entryPath:", colors.green(entryPath));
      const entryModule = this.buildModule(entryName, entryPath);
      this.entries.add(entryModule);
      this.modules.add(entryModule);
    }
    console.log("this.entries:", colors.red(this.entries));
    console.log("this.modules:", colors.red(this.modules));
  }
}

/**
 *
 *
 * @param {*} modulePath 拼出来的模块路径 D:/myProject/webpack/webpackflow/src/title
 * @param {*} extensions ['.js', '.jsx', '.json']
 * @param {*} originModulePath  .title
 * @param {*} moduleContext D:/myProject/webpack/webpackflow/src
 */
function tryExtensions(
  modulePath,
  extensions,
  originModulePath,
  moduleContext
) {
  extensions.unshift("");
  for (let i = 0; i < extensions.length; i++) {
    if (fs.existsSync(modulePath + extensions[i])) {
      return modulePath + extensions[i];
    }
  }
  // 如果到了这里，说明没有一个后缀可以匹配， 抛出异常
  throw new Error(
    `Module not found: Error:Can't resolve ${originModulePath} in ${moduleContext}`
  );
}

module.exports = Compiler;
