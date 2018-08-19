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
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
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
  isKeepingTime: isKeepingTime
};

function freeze() {
  useFakeDate();

  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
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

  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
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
var chronokinesis_1 = chronokinesis.freeze;
var chronokinesis_2 = chronokinesis.defrost;
var chronokinesis_3 = chronokinesis.travel;
var chronokinesis_4 = chronokinesis.reset;
var chronokinesis_5 = chronokinesis.isKeepingTime;

export default chronokinesis;
export { chronokinesis_1 as freeze, chronokinesis_2 as defrost, chronokinesis_3 as travel, chronokinesis_4 as reset, chronokinesis_5 as isKeepingTime };
