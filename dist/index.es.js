/**
 * Borrowed from Time keeper - EEasy testing of time-dependent code.
 *
 * Veselin Todorov <hi@vesln.com>
 * MIT License.
 */

var NativeDate = Date;
var instance = {};

var freeze = null;
var travel = null;
var started = null;

instance.freeze = function () {
  useFakeDate();
  freeze = instantiate(Date, arguments);
  return freeze;
};

instance.defrost = function () {
  freeze = null;
};

instance.travel = function () {
  useFakeDate();

  var travelToDate = instantiate(Date, arguments);

  travel = travelToDate.getTime();
  started = NativeDate.now();

  if (freeze) {
    freeze = travelToDate;
  }

  return travelToDate;
};

instance.reset = function (callback) {
  useNativeDate();
  freeze = null;
  started = null;
  travel = null;
  return callback && callback();
};

instance.isKeepingTime = function () {
  return Date === FakeDate;
};

function useFakeDate() {
  Date = FakeDate; // eslint-disable-line no-global-assign
}

function useNativeDate() {
  Date = NativeDate; // eslint-disable-line no-global-assign
}

function FakeDate() {
  var length = arguments.length;

  if (!length && freeze) return new NativeDate(freeze);
  if (!length && travel) return new NativeDate(time());

  var date = instantiate(NativeDate, arguments);

  return date;
}

function time() {
  return travel + (NativeDate.now() - started);
}

FakeDate.UTC = NativeDate.UTC;
FakeDate.parse = NativeDate.parse;

FakeDate.prototype = NativeDate.prototype;

FakeDate.now = function () {
  if (freeze) return freeze.getTime();
  return time();
};

function instantiate(type, args) {
  var ctorArgs = Array.prototype.slice.call(args);
  return new (Function.prototype.bind.apply(type, [null].concat(ctorArgs)))();
}

var index = instance;

export default index;
