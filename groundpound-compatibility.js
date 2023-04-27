'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      var F = function () {};
      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

var Observable = /*#__PURE__*/function () {
  function Observable(value, runWithoutMutator) {
    _classCallCheck(this, Observable);
    _defineProperty(this, "subscribers", []);
    this.value = value;
    this.rwm = runWithoutMutator;
  }
  _createClass(Observable, [{
    key: "set",
    value: function set(newValue) {
      if (this.value !== newValue) {
        this.value = newValue;
        subscribers.forEach(function (sub) {
          this.rwm(sub);
        });
      }
    }
  }, {
    key: "bindNode",
    value: function bindNode(node) {
      if (node.dataset.vfield) {
        node.addEventListener('change', function (event) {
          this.set(event.target.value);
        });
      } else {
        subscribers.push(function () {
          node.innerHTML = this.value;
        });
      }
    }
  }]);
  return Observable;
}();

var ViewModel = /*#__PURE__*/function () {
  function ViewModel(contextNode) {
    _classCallCheck(this, ViewModel);
    //listen for DOM updates (particularly from the server)
    this.contextNode = contextNode;
    this.config = {
      attributes: true,
      childList: true,
      subtree: true
    };
    this.observer = new MutationObserver(function (mutationsList, obs) {
      // Use traditional 'for loops' for IE 11
      var _iterator = _createForOfIteratorHelper(mutationsList),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var mutation = _step.value;
          if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
            var newNode = mutation.addedNodes[0];
            buildModel(newNode, this);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    });
    this.observer.observe(contextNode, this.config);
    buildModel(contextNode, this);
  }
  _createClass(ViewModel, [{
    key: "runWithoutMutator",
    value: function runWithoutMutator(callback) {
      observer.disconnect();
      callback();
      observer.observe(this.contextNode, this.config);
    }
  }, {
    key: "buildModel",
    value: function (_buildModel) {
      function buildModel(_x, _x2) {
        return _buildModel.apply(this, arguments);
      }
      buildModel.toString = function () {
        return _buildModel.toString();
      };
      return buildModel;
    }(function (node, assignmentObj) {
      if (node.attributes && node.dataset.vtext) {
        if (!assignmentObj[node.dataset.vtext]) assignmentObj[node.dataset.vtext] = new Observable(node.innerText, runWithoutMutator);
        assignmentObj[node.dataset.vtext].bindNode(node);
      }
      if (node.attributes && node.dataset.vfield) {
        if (!assignmentObj[node.dataset.vfield]) assignmentObj[node.dataset.vfield] = new Observable(node.value, runWithoutMutator);
        assignmentObj[node.dataset.vfield].bindNode(node);
      }
      if (node.attributes && node.dataset.vclick) {
        node.onclick = function () {
          ctx[node.dataset.vclick](assignmentObj);
        };
      }
      if (node.attributes && node.dataset.vlist) ;
      for (var i = 0; i < node.children.length; i++) {
        buildModel(node.children[i], assignmentObj);
      }
    })
  }]);
  return ViewModel;
}();

exports.Observable = Observable;
exports.ViewModel = ViewModel;
