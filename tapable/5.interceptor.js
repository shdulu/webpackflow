const { SyncHook } = require("./index");
const hook = new SyncHook(["name", "age"]);

hook.intercept({
  // 每当注册一个新的函数的时候触发
  register: (tapInfo) => {
    console.log("拦截器1开始register", tapInfo.name);
    return tapInfo;
  },
  tap: (tapInfo) => {
    // 每个回调函数都会触发一次
    console.log("拦截器1开始tap", tapInfo.name);
  },
  call: (name, age) => {
    // 每个call只会触发一次，所有的回调只有一次
    console.log("拦截器1开始call", name, age);
  },
});

hook.tap({ name: "回调函数A" }, (name, age) => {
  console.log("回调函数A", name, age);
});
hook.tap({ name: "回调函数B" }, (name, age) => {
  console.log("回调函数B", name, age);
});
hook.call("shdulu", 30);

// 拦截器1开始register 回调函数A
// 拦截器2开始register 回调函数A
// 拦截器1开始register 回调函数B
// 拦截器2开始register 回调函数B
// 拦截器1开始call shdulu 88
// 拦截器2开始call shdulu 88
// 拦截器1开始tap 修改后的回调函数A
// 拦截器2开始tap 修改后的回调函数A
// 回调函数A shdulu 88
// 拦截器1开始tap 修改后的回调函数A
// 拦截器2开始tap 修改后的回调函数A
// 回调函数B shdulu 88

// hook.intercept({
//   // 每当注册一个新的函数的时候触发
//   register: (tapInfo) => {
//     console.log("拦截器2开始register", tapInfo.name);
//     tapInfo.name = "修改后的回调函数A";
//     return tapInfo;
//   },
//   tap: (tapInfo) => {
//     // 每个回调函数都会触发一次
//     console.log("拦截器2开始tap", tapInfo.name);
//   },
//   call: (name, age) => {
//     // 每个call只会触发一次，所有的回调只有一次
//     console.log("拦截器2开始call", name, age);
//   },
// });
