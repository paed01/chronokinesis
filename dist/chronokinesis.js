var chronokinesis = (function (exports) {
  'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
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
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  /**
   * Inspired by Time keeper - EEasy testing of time-dependent code.
   *
   * Veselin Todorov <hi@vesln.com>
   * MIT License.
   */
  var NativeDate = Date;
  var nativeGetTimezoneOffset = NativeDate.prototype.getTimezoneOffset;
  var freezedAt = null;
  var traveledTo = null;
  var started = null;
  var iana = null;
  function FakeDate() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var length = args.length;
    if (!length) {
      if (freezedAt) args = [freezedAt];else if (traveledTo) args = [time()];
    }
    var dt = instantiate(NativeDate, args);
    Object.defineProperty(dt, 'getTimezoneOffset', {
      enumerable: false,
      value: function getTimezoneOffset() {
        var curr = nativeGetTimezoneOffset.call(this);
        if (!iana) return curr;
        var tz = timezone(iana).getTime(this);
        return Math.round((tz - this.getTime()) / 60000) + curr;
      }
    });
    return dt;
  }
  FakeDate.UTC = NativeDate.UTC;
  FakeDate.parse = NativeDate.parse;
  FakeDate.prototype = NativeDate.prototype;
  FakeDate.now = function () {
    if (freezedAt) return freezedAt.getTime();
    return time();
  };
  var chronokinesis = {
    freeze: freeze,
    defrost: defrost,
    travel: travel,
    reset: reset,
    isKeepingTime: isKeepingTime,
    timezone: timezone
  };
  function freeze() {
    useFakeDate();
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    freezedAt = instantiate(Date, args);
    return freezedAt;
  }
  function defrost() {
    freezedAt = null;
  }
  function travel() {
    useFakeDate();
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    var travelToDate = instantiate(Date, args);
    traveledTo = travelToDate.getTime();
    started = NativeDate.now();
    if (freezedAt) {
      freezedAt = travelToDate;
    }
    return travelToDate;
  }
  function reset() {
    useNativeDate();
    freezedAt = null;
    started = null;
    traveledTo = null;
    iana = null;
  }
  function isKeepingTime() {
    return Date === FakeDate;
  }
  function timezone(timeZone) {
    var options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    };
    var current = Intl.DateTimeFormat('UTC', options);
    var formatter = Intl.DateTimeFormat('UTC', _objectSpread2({
      timeZone: timeZone
    }, options));
    return {
      timeZone: timeZone,
      defrost: defrost,
      reset: reset,
      isKeepingTime: isKeepingTime,
      getTime: getTime,
      freeze: freezeInTimezone,
      travel: travelInTimezone
    };
    function freezeInTimezone() {
      if (!arguments.length && iana === timeZone) return freeze();
      iana = timeZone;
      return freeze(getTime.apply(void 0, arguments));
    }
    function travelInTimezone() {
      if (!arguments.length && iana === timeZone) return travel();
      iana = timeZone;
      return travel(getTime.apply(void 0, arguments));
    }
    function getTime() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      var realDate = instantiate(Date, args);
      var tz = new NativeDate(toUTC(formatter, realDate));
      if (!args.length) return tz.getTime();
      var currentTz = new NativeDate(toUTC(current, realDate));
      return realDate.getTime() + currentTz.getTime() - tz.getTime();
    }
  }
  function useFakeDate() {
    Date = FakeDate; // eslint-disable-line no-global-assign
  }

  function useNativeDate() {
    Date = NativeDate; // eslint-disable-line no-global-assign
  }

  function time() {
    return traveledTo + (NativeDate.now() - started);
  }
  function instantiate(type, args) {
    var ctorArgs = args.slice();
    ctorArgs.unshift(null);
    return new (Function.prototype.bind.apply(type, ctorArgs))();
  }
  function toUTC(formatter, dt) {
    var year, month, day, hour, minute, second;
    var _iterator = _createForOfIteratorHelper(formatter.formatToParts(dt)),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _step.value,
          type = _step$value.type,
          value = _step$value.value;
        switch (type) {
          case 'year':
            year = parseInt(value);
            break;
          case 'month':
            month = parseInt(value) - 1;
            break;
          case 'day':
            day = parseInt(value);
            break;
          case 'hour':
            hour = parseInt(value) % 24;
            break;
          case 'minute':
            minute = parseInt(value);
            break;
          case 'second':
            second = parseInt(value);
            break;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return NativeDate.UTC(year, month, day, hour, minute, second, dt.getMilliseconds());
  }
  var chronokinesis_1 = chronokinesis.freeze;
  var chronokinesis_2 = chronokinesis.defrost;
  var chronokinesis_3 = chronokinesis.travel;
  var chronokinesis_4 = chronokinesis.reset;
  var chronokinesis_5 = chronokinesis.isKeepingTime;
  var chronokinesis_6 = chronokinesis.timezone;

  exports.default = chronokinesis;
  exports.defrost = chronokinesis_2;
  exports.freeze = chronokinesis_1;
  exports.isKeepingTime = chronokinesis_5;
  exports.reset = chronokinesis_4;
  exports.timezone = chronokinesis_6;
  exports.travel = chronokinesis_3;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
