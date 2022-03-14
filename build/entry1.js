(function () {
  var __webpack_modules__ = {
    "./src/title.js": function (module) {
      module.exports = "title"; //logger2//logger1
    },
  };

  var __webpack_module_cache__ = {};

  function require(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (__webpack_module_cache__[moduleId] = {
      exports: {},
    });

    __webpack_modules__[moduleId](module, module.exports, require);

    return module.exports;
  }

  var __webpack_exports__ = {};
  !(function () {
    const title = require("./src/title.js");

    console.log("entry1", title); //logger2//logger1
  })();
})();
