const { SyncHook } = require("./index");

const hook = new SyncHook(["name", "age"]);

hook.tap("1", (name, age) => {
  console.log("1 - tap", name, age);
});
hook.tap("2", (name, age) => {
  console.log("2 - tap", name, age);
});
hook.tap("3", (name, age) => {
  console.log("3 - tap", name, age);
});
debugger
hook.call("shdulu", 20);
