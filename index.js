/**
 * Inspired by Time keeper - EEasy testing of time-dependent code.
 *
 * Veselin Todorov <hi@vesln.com>
 * MIT License.
 */
'use strict';

const NativeDate = Date;

let freezedAt = null;
let traveledTo = null;
let started = null;

function FakeDate(...args) {
  const length = args.length;

  if (!length && freezedAt) return new NativeDate(freezedAt);
  if (!length && traveledTo) return new NativeDate(time());

  return instantiate(NativeDate, args);
}

FakeDate.UTC = NativeDate.UTC;
FakeDate.parse = NativeDate.parse;

FakeDate.prototype = NativeDate.prototype;

FakeDate.now = function() {
  if (freezedAt) return freezedAt.getTime();
  return time();
};

module.exports = {
  freeze,
  defrost,
  travel,
  reset,
  isKeepingTime,
};

function freeze(...args) {
  useFakeDate();
  freezedAt = instantiate(Date, args);
  return freezedAt;
}

function defrost() {
  freezedAt = null;
}

function travel(...args) {
  useFakeDate();

  const travelToDate = instantiate(Date, args);

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
  const ctorArgs = args.slice();
  ctorArgs.unshift(null);
  return new (Function.prototype.bind.apply(type, ctorArgs))();
}
