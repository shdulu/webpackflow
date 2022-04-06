const { HookMap, SyncHook } = require("./index");

// webpack 模块类型很多，为了支持各种各样不同的模块

const map = new HookMap(() => new SyncHook(["name"]));

map.for("key1").tap("plugin1", (name) => {
  console.log(1, name);
});
debugger
map.for("key1").tap("plugin2", (name) => {
  console.log(2, name);
});

let hook = map.get("key1");

hook.call("shdulu");
