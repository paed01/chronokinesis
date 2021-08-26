var chronokinesis = (function (exports) {
  'use strict';

  /**
   * Inspired by Time keeper - EEasy testing of time-dependent code.
   *
   * Veselin Todorov <hi@vesln.com>
   * MIT License.
   */

  var NativeDate = Date;
  var freezedAt = null;
  var traveledTo = null;
  var started = null;

  function FakeDate() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var length = args.length;
    if (!length && freezedAt) return new NativeDate(freezedAt);
    if (!length && traveledTo) return new NativeDate(time());
    return instantiate(NativeDate, args);
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
  }

  function isKeepingTime() {
    return Date === FakeDate;
  }

  function timezone(timeZone) {
    var formatter = Intl.DateTimeFormat('UTC', {
      timeZone: timeZone,
      timeStyle: 'full',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    return {
      timeZone: timeZone,
      defrost: defrost,
      reset: reset,
      isKeepingTime: isKeepingTime,
      getUTCOffset: getUTCOffset.bind(this, formatter),
      freeze: freezeInTimezone,
      travel: travelInTimezone
    };

    function freezeInTimezone() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      if (isKeepingTime() && !args.length) return freeze();
      var realDate = instantiate(NativeDate, args);
      var offset = getUTCOffset(formatter, realDate);
      return freeze(new NativeDate(realDate.getTime() + offset));
    }

    function travelInTimezone() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      if (isKeepingTime() && !args.length) return travel();
      var realDate = instantiate(NativeDate, args);
      var offset = getUTCOffset(formatter, realDate);
      return travel(new NativeDate(realDate.getTime() + offset));
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

  function getUTCOffset(formatter, dt) {
    if (!dt) dt = new Date();
    var dtSeconds = new NativeDate(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
    var tzDate = new NativeDate(formatter.format(dtSeconds));
    var tzUTC = NativeDate.UTC(tzDate.getFullYear(), tzDate.getMonth(), tzDate.getDate(), tzDate.getHours(), tzDate.getMinutes(), tzDate.getSeconds());
    return tzUTC - dtSeconds;
  }
  var chronokinesis_1 = chronokinesis.freeze;
  var chronokinesis_2 = chronokinesis.defrost;
  var chronokinesis_3 = chronokinesis.travel;
  var chronokinesis_4 = chronokinesis.reset;
  var chronokinesis_5 = chronokinesis.isKeepingTime;
  var chronokinesis_6 = chronokinesis.timezone;

  exports['default'] = chronokinesis;
  exports.defrost = chronokinesis_2;
  exports.freeze = chronokinesis_1;
  exports.isKeepingTime = chronokinesis_5;
  exports.reset = chronokinesis_4;
  exports.timezone = chronokinesis_6;
  exports.travel = chronokinesis_3;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
