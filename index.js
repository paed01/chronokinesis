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
  timezone,
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

function timezone(timeZone) {
  const formatter = Intl.DateTimeFormat('UTC', {
    timeZone: timeZone,
    timeStyle: 'full',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  return {
    timeZone,
    defrost,
    reset,
    isKeepingTime,
    getUTCOffset: getUTCOffset.bind(this, formatter),
    freeze: freezeInTimezone,
    travel: travelInTimezone,
  };

  function freezeInTimezone(...args) {
    if (isKeepingTime() && !args.length) return freeze();

    const realDate = instantiate(NativeDate, args);
    const offset = getUTCOffset(formatter, realDate);
    return freeze(new NativeDate(realDate.getTime() + offset));
  }

  function travelInTimezone(...args) {
    if (isKeepingTime() && !args.length) return travel();

    const realDate = instantiate(NativeDate, args);
    const offset = getUTCOffset(formatter, realDate);
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
  const ctorArgs = args.slice();
  ctorArgs.unshift(null);
  return new (Function.prototype.bind.apply(type, ctorArgs))();
}

function getUTCOffset(formatter, dt) {
  if (!dt) dt = new Date();
  const dtSeconds = new NativeDate(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
  const tzDate = new NativeDate(formatter.format(dtSeconds));
  const tzUTC = NativeDate.UTC(tzDate.getFullYear(), tzDate.getMonth(), tzDate.getDate(), tzDate.getHours(), tzDate.getMinutes(), tzDate.getSeconds());
  return tzUTC - dtSeconds;
}
