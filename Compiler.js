const path = require("path");
const fs = require("fs");
const { SyncHook } = require("tapable");
const colors = require("colors/safe");
const types = require("babel-types"); // 判断某个节点是否是某个类型，生成某个新的节点
const parser = require("@babel/parser"); // 把源代码生成AST抽象语法树
const traverse = require("@babel/traverse").default; // 遍历器遍历AST语法树
const generator = require("@babel/generator").default; // 代码生成器,根据语法树重新生成新的代码
const { toUnixPath } = require("./utils");

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

          let alreadyModuleIds = Array.from(this.modules).map(
            (item) => item.id
          );
          // 如果编译过的模块里不包含这个依赖模块才添加
          if (!alreadyModuleIds.includes(depModuleId)) {
            module.dependencies.push(depModulePath);
          }
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
      // 8. 根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk
      let chunk = {
        name: entryName,
        entryModule,
        modules: this.modules.filter((module) => module.name === entryName),
      };
      this.chunks.add(chunk);
    }
    // 9. 再把每个 Chunk 转换成一个单独的文件加入到输出列表, this.assets对象，key文件名，值文件内容
    const output = this.options.output;
    this.chunks.forEach((chunk) => {
      const filename = path.join(
        output.path,
        output.filename.replace("[name]", chunk.name)
      );
      this.assets[filename] = getSource(chunk);
    });
  }
}

/**
 * 获取chunk对应的源码
 *
 * @param {*} chunk
 */
function getSource(chunk) {
  return `(function () {
    var __webpack_modules__ = {
      ${chunk.modules
        .map(
          (module) => `
      "${module.id}": function (module) {
        ${module._source}
      }`
        )
        .join(",")}
    };
  
    var __webpack_module_cache__ = {};
  
    function __webpack_require__(moduleId) {
      var cachedModule = __webpack_module_cache__[moduleId];
      if (cachedModule !== undefined) {
        return cachedModule.exports;
      }
      var module = (__webpack_module_cache__[moduleId] = {
        exports: {},
      });
  
      __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
  
      return module.exports;
    }
  
    var __webpack_exports__ = {};
    !(function () {
      ${chunk.entryModule._source}
    })();
  })();
  `;
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
