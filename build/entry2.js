(function () {
    var __webpack_modules__ = {
      
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

console.log('entry2', title); //logger2//logger1
    })();
  })();
  