/**
 * Borrowed from Time keeper - EEasy testing of time-dependent code.
 *
 * Veselin Todorov <hi@vesln.com>
 * MIT License.
 */

'use strict';

const NativeDate = Date;
const instance = {};

let freeze = null;
let travel = null;
let started = null;

function FakeDate() {
  var length = arguments.length;

  if (!length && freeze) return new NativeDate(freeze);
  if (!length && travel) return new NativeDate(time());

  let args = Array.prototype.slice.call(arguments);
  let date = new (Function.prototype.bind.apply(NativeDate, [null].concat(args)))();

  return date;
}

function time() {
  return travel + (NativeDate.now() - started);
}

FakeDate.UTC = NativeDate.UTC;
FakeDate.parse = NativeDate.parse;

FakeDate.prototype = NativeDate.prototype;
FakeDate.prototype.constructor = NativeDate.constructor;

FakeDate.now = function() {
  if (freeze) return freeze.getTime();
  return time();
};

instance.freeze = function(date) {
  useFakeDate();

  if (!date) {
    date = new NativeDate();
  } else {
    date = new NativeDate(date);
  }

  freeze = date;

  return date;
};

instance.travel = function(travelToDate) {
  useFakeDate();

  if (!travelToDate) {
    travelToDate = new NativeDate();
  } else {
    travelToDate = new NativeDate(travelToDate);
  }

  travel = travelToDate.getTime();
  started = NativeDate.now();
};

instance.reset = function(callback) {
  useNativeDate();
  freeze = null;
  started = null;
  travel = null;
  return callback && callback();
};

instance.isKeepingTime = function() {
  return Date === FakeDate;
};

function useFakeDate() {
  Date = FakeDate;
}

function useNativeDate() {
  Date = NativeDate;
}

module.exports = instance;
