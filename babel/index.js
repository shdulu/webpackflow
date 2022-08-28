// babel 核心包，用来实现语法树生成、遍历、修改和生成源代码
const core = require("@babel/core");
// 用来生成某些AST节点或者判断某个节点是不是某个类型
const types = require("@babel/types");

const sourceCode = `const sum = (a, b) => {
  console.log(this)
  const minus = (a, b) => {
    console.log(this)
  }
  return a + b
}`;

const transformEs2015ArrowFunction = {
  // 访问者模式 Visitor 对于某个对象或者一组对象，不同的访问者，产生的结果不同，执行操作也不同
  // Visitor 的对象定义了用于 AST 中获取具体节点的方法
  // Visitor 上挂载以节点 type 命名的方法，当遍历 AST 的时候，如果匹配上 type，就会执行对应的方法
  visitor: {
    ArrowFunctionExpression(path) {
      let { node } = path;
      hoistFunctionEnvironment(path);
      let body = node.body;
      node.type = "FunctionExpression";
      if (!types.isBlockStatement(body)) {
        node.body = types.blockStatement([types.returnStatement(body)]);
      }
    },
  },
};
function hoistFunctionEnvironment(path) {
  // 1. 确定我们要用哪里的this，向上找不是箭头函数的函数或者根节点
  const thisEnv = path.findParent((parent) => {
    return (
      (parent.isFunction() && !path.isArrowFunctionExpression()) ||
      parent.isProgram()
    );
  });

  let thisPaths = getThisPaths(path);
  if (thisPaths.length > 0) {
    let thisBindings = "_this";
    // 在thisEnv这个节点的作用域中添加一个变量  变量名为_this，值为this var _this = this
    if (!thisEnv.scope.hasBinding(thisBindings)) {
      thisEnv.scope.push({
        id: types.identifier(thisBindings),
        init: types.thisExpression(),
      });
    }
    thisPaths.forEach((thisPath) => {
      // this => _this
      thisPath.replaceWith(types.identifier(thisBindings));
    });
  }
}
function getThisPaths(path) {
  let thisPaths = [];
  path.traverse({
    ThisExpression(path) {
      thisPaths.push(path);
    },
  });
  return thisPaths;
}

const targetCode = core.transform(sourceCode, {
  // es6 -> es5插件
  // plugins: ["transform-es2015-arrow-functions"],
  plugins: [transformEs2015ArrowFunction],
});
console.log(targetCode.code);
