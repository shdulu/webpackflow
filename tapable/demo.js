(function anonymous(name, age, _callback) {
  "use strict";
  var _context;
  var _x = this._x;
  function _next1() {
    var _fn2 = _x[2];
    _fn2(name, age, function (_err2) {
      if (_err2) {
        _callback(_err2);
      } else {
        _callback();
      }
    });
  }
  function _next0() {
    var _fn1 = _x[1];
    _fn1(name, age, function (_err1) {
      if (_err1) {
        _callback(_err1);
      } else {
        _next1();
      }
    });
  }
  var _fn0 = _x[0];
  _fn0(name, age, function (_err0) {
    if (_err0) {
      _callback(_err0);
    } else {
      _next0();
    }
  });
});
