class HookMap {
  constructor(createHookFactory) {
    this._map = new Map();
    this.createHookFactory = createHookFactory;
  }
  get(key) {
    return this._map.get(key);
  }
  for(key) {
    let hook = this.get(key);
    if (hook) return hook;
    let newHook = this.createHookFactory();
    this._map.set(key, newHook);
    return newHook;
  }
}

module.exports = HookMap;
