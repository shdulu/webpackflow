function readonly(target, key, descriptor) {
  descriptor.writable = false;
}
function withLog(target, key, descriptor) {}

@withLog
export class Person {
  @readonly PI = 3.14;
}
let person = new Person();
person.PI = 3.14;
console.log(person.PI);
