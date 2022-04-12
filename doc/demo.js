const AsyncQueue = require("./AsyncQueue");

function processor(item, callback) {
  setTimeout(() => {
    console.log(item);
    callback(null, { item });
  }, 3000);
}
const getKey = (item) => {
  return item.key;
};
const queue = new AsyncQueue({
  name: "createModule",
  parallelism: 3,
  processor,
  getKey,
});
const start = Date.now();
let item1 = { key: "module1" };

queue.add(item1, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});

queue.add({ key: "module2" }, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});

queue.add({ key: "module3" }, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});
queue.add({ key: "module4" }, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});
