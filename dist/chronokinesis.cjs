(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.chronokinesis = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Inspired by Time keeper - EEasy testing of time-dependent code.
   *
   * Veselin Todorov <hi@vesln.com>
   * MIT License.
   */
  const kNativeDate = Symbol.for('chronokinesis native date');

  const NativeDate = Date[kNativeDate] || Date;
  const nativeGetTimezoneOffset = NativeDate.prototype.getTimezoneOffset;

  let freezedAt = null;
  let traveledTo = null;
  let started = null;
  let iana = null;

  function FakeDate(...args) {
    const length = args.length;
    if (!length) {
      if (freezedAt) args = [freezedAt];
      else if (traveledTo) args = [time()];
    }

    const dt = instantiate(NativeDate, args);

    Object.defineProperty(dt, 'getTimezoneOffset', {
      enumerable: false,
      value: function getTimezoneOffset() {
        const curr = nativeGetTimezoneOffset.call(this);
        if (!iana) return curr;

        const tz = new TimeZoneTraveller(iana).getTime(this);
        return Math.round((tz - this.getTime()) / 60000) + curr;
      },
    });

    return dt;
  }

  FakeDate[kNativeDate] = NativeDate;

  FakeDate.UTC = NativeDate.UTC;
  FakeDate.parse = NativeDate.parse;

  FakeDate.prototype = NativeDate.prototype;

  FakeDate.now = function fakeNow() {
    if (freezedAt) return freezedAt.getTime();
    return time();
  };

  function freeze(...args) {
    useFakeDate();
    freezedAt = instantiate(Date, args);
    if (isNaN(freezedAt)) {
      reset();
      throw new TypeError('Chronokinesis cannot freeze to invalid date, check your arguments. Chronokinesis is reset');
    }
    return freezedAt;
  }

  function defrost() {
    freezedAt = null;
  }

  function travel(...args) {
    useFakeDate();
    const travelToDate = instantiate(Date, args);
    if (isNaN(travelToDate)) {
      reset();
      throw new TypeError('Chronokinesis cannot travel to invalid date, check your arguments. Chronokinesis is reset');
    }

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

  function TimeZoneTraveller(timeZone) {
    this.timeZone = timeZone;
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    };
    this.localFormatter = Intl.DateTimeFormat('UTC', options);
    this.timeZoneFormatter = Intl.DateTimeFormat('UTC', {
      timeZone,
      ...options,
    });
  }

  TimeZoneTraveller.prototype.defrost = defrost;
  TimeZoneTraveller.prototype.reset = reset;
  TimeZoneTraveller.prototype.isKeepingTime = isKeepingTime;

  TimeZoneTraveller.prototype.getTime = function timeZoneGetTime(...args) {
    const realDate = instantiate(Date, args);
    const tz = new NativeDate(toUTC(this.timeZoneFormatter, realDate));

    if (!args.length) return tz.getTime();
    const currentTz = new NativeDate(toUTC(this.localFormatter, realDate));

    return realDate.getTime() + currentTz.getTime() - tz.getTime();
  };

  TimeZoneTraveller.prototype.freeze = function freezeInTimezone(...args) {
    if (!args.length && iana === this.timeZone) return freeze();
    iana = this.timeZone;
    return freeze(this.getTime(...args));
  };

  TimeZoneTraveller.prototype.travel = function timeZoneTravel(...args) {
    if (!args.length && iana === this.timeZone) return travel();
    iana = this.timeZone;
    return travel(this.getTime(...args));
  };

  function timezone(timeZone, ...args) {
    const tz = new TimeZoneTraveller(timeZone);
    tz.travel(...args);
    return tz;
  }

  function useFakeDate() {
    Date = FakeDate;
  }

  function useNativeDate() {
    Date = FakeDate[kNativeDate];
  }

  function time() {
    return traveledTo + (NativeDate.now() - started);
  }

  function instantiate(type, args) {
    const ctorArgs = args.slice();
    ctorArgs.unshift(null);
    return new (Function.prototype.bind.apply(type, ctorArgs))();
  }

  function toUTC(formatter, dt) {
    let year, month, day, hour, minute, second;

    for (const { type, value } of formatter.formatToParts(dt)) {
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

    return NativeDate.UTC(year, month, day, hour, minute, second, dt.getMilliseconds());
  }

  exports.FakeDate = FakeDate;
  exports.TimeZoneTraveller = TimeZoneTraveller;
  exports.defrost = defrost;
  exports.freeze = freeze;
  exports.isKeepingTime = isKeepingTime;
  exports.reset = reset;
  exports.timezone = timezone;
  exports.travel = travel;

}));
