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

function FakeDate(Y, M, D, h, m, s, ms) {
  var length = arguments.length;

  if (this instanceof NativeDate) {

    if (!length && freeze) return new NativeDate(freeze);
    if (!length && travel) return new NativeDate(time());

    var date = length === 1 && String(Y) === Y ? // isString(Y)
      // We explicitly pass it through parse:
      new NativeDate(NativeDate.parse(Y)) :
      // We have to manually make calls depending on argument
      // length here
      length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
      length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
      length >= 5 ? new NativeDate(Y, M, D, h, m) :
      length >= 4 ? new NativeDate(Y, M, D, h) :
      length >= 3 ? new NativeDate(Y, M, D) :
      length >= 2 ? new NativeDate(Y, M) :
      length >= 1 ? new NativeDate(Y) :
      new NativeDate();
    // Prevent mixups with unfixed Date object
    date.constructor = NativeDate;
    return date;
  }

  return NativeDate.apply(this, arguments);
}

function time() {
  return travel + (NativeDate.now() - started);
}

for (let key in NativeDate) {
  FakeDate[key] = NativeDate[key];
}

FakeDate.UTC = NativeDate.UTC;
FakeDate.parse = NativeDate.parse;

FakeDate.prototype = NativeDate.prototype;
FakeDate.prototype.constructor = NativeDate;

FakeDate.now = function() {
  if (freeze) return freeze.getTime();
  if (travel) return time();
  return NativeDate.now();
};

instance.freeze = function(date) {
  useFakeDate();

  if (typeof date !== 'object') {
    date = new NativeDate(date);
  }

  freeze = date;
};

instance.travel = function(date) {
  useFakeDate();

  if (typeof date !== 'object') {
    date = new NativeDate(date);
  }

  travel = date.getTime();
  started = NativeDate.now();
};

instance.reset = function() {
  useNativeDate();
  freeze = null;
  started = null;
  travel = null;
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
