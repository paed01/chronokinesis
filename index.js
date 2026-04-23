/**
 * Inspired by Time keeper - EEasy testing of time-dependent code.
 *
 * Veselin Todorov <hi@vesln.com>
 * MIT License.
 */
const kNativeDate = Symbol.for('chronokinesis native date');

const NativeDate = Date[kNativeDate] || Date;
const nativeGetTimezoneOffset = NativeDate.prototype.getTimezoneOffset;

/* c8 ignore start -- environment-capability guards; false branches only hit in browser (isomorphic test) */
const nativeProcess = typeof process !== 'undefined' ? process : null;
const nativeHrtime = nativeProcess && typeof nativeProcess.hrtime === 'function' ? nativeProcess.hrtime : null;
const nativeHrtimeBigint = nativeHrtime && typeof nativeHrtime.bigint === 'function' ? nativeHrtime.bigint : null;
const nativePerformance = typeof performance !== 'undefined' ? performance : null;
const nativePerformanceNow = nativePerformance && typeof nativePerformance.now === 'function' ? nativePerformance.now : null;

// Anchor native perf.now against native hrtime at module load so that later reads
// can reconstruct real native perf.now even when process.hrtime has been swapped
// (Node <24 wires performance.now to process.hrtime internally).
const perfAnchorMs = nativePerformanceNow ? nativePerformanceNow.call(nativePerformance) : 0;
const hrtimeAnchorNs = nativeHrtimeBigint ? nativeHrtimeBigint.call(nativeProcess) : 0n;
/* c8 ignore stop */

let freezedAt = null;
let traveledTo = null;
let started = null;
let iana = null;
let hrtimeOffset = 0n;
let performanceNowOffset = 0;
let freezedHrtimeNs = null;
let freezedPerformanceNow = null;

export function FakeDate(...args) {
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

export function freeze(...args) {
  useFakeDate();
  const target = instantiate(Date, args);
  if (isNaN(target)) {
    reset();
    throw new TypeError('Chronokinesis cannot freeze to invalid date, check your arguments. Chronokinesis is reset');
  }
  const prevMockedMs = currentMockedMs();
  freezedAt = target;
  shiftAndLockFakeClocks(target.getTime() - prevMockedMs);
  return freezedAt;
}

export function defrost() {
  freezedAt = null;
  freezedHrtimeNs = null;
  freezedPerformanceNow = null;
}

export function travel(...args) {
  useFakeDate();
  const travelToDate = instantiate(Date, args);
  if (isNaN(travelToDate)) {
    reset();
    throw new TypeError('Chronokinesis cannot travel to invalid date, check your arguments. Chronokinesis is reset');
  }

  const prevMockedMs = currentMockedMs();
  traveledTo = travelToDate.getTime();
  started = NativeDate.now();
  const deltaMs = traveledTo - prevMockedMs;
  if (nativeHrtimeBigint) hrtimeOffset += BigInt(deltaMs) * 1_000_000n;
  if (nativePerformanceNow) performanceNowOffset += deltaMs;

  if (freezedAt) {
    freezedAt = travelToDate;
    if (nativeHrtimeBigint) freezedHrtimeNs = nativeHrtimeBigint.call(nativeProcess) + hrtimeOffset;
    if (nativePerformanceNow) freezedPerformanceNow = nativePerformanceNowFromHrtime() + performanceNowOffset;
  }

  return travelToDate;
}

export function reset() {
  useNativeDate();
  freezedAt = null;
  started = null;
  traveledTo = null;
  iana = null;
  hrtimeOffset = 0n;
  performanceNowOffset = 0;
  freezedHrtimeNs = null;
  freezedPerformanceNow = null;
}

export function isKeepingTime() {
  return Date === FakeDate;
}

export function TimeZoneTraveller(timeZone) {
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

export function timezone(timeZone, ...args) {
  const tz = new TimeZoneTraveller(timeZone);
  tz.travel(...args);
  return tz;
}

function useFakeDate() {
  Date = FakeDate;
  if (nativeHrtime) nativeProcess.hrtime = fakeHrtime;
  if (nativePerformanceNow) {
    Object.defineProperty(nativePerformance, 'now', { value: fakePerformanceNow, configurable: true, writable: true });
  }
}

function useNativeDate() {
  Date = FakeDate[kNativeDate];
  if (nativeHrtime) nativeProcess.hrtime = nativeHrtime;
  if (nativePerformanceNow) {
    Object.defineProperty(nativePerformance, 'now', { value: nativePerformanceNow, configurable: true, writable: true });
  }
}

function time() {
  return traveledTo + (NativeDate.now() - started);
}

function currentMockedMs() {
  if (freezedAt) return freezedAt.getTime();
  if (traveledTo !== null) return time();
  return NativeDate.now();
}

function nativePerformanceNowFromHrtime() {
  // Older Node (<24) wires performance.now() to process.hrtime internally, so
  // calling nativePerformanceNow directly would pick up our hrtime swap and
  // double-shift. Rebuild perf.now from the preserved hrtime.bigint reference,
  // anchored to a native perf.now reading captured at module load.
  if (nativeHrtimeBigint) {
    const elapsedNs = nativeHrtimeBigint.call(nativeProcess) - hrtimeAnchorNs;
    return perfAnchorMs + Number(elapsedNs) / 1_000_000;
  }
  /* c8 ignore next -- browser fallback; covered by isomorphic test, not by Node c8 */
  return nativePerformanceNow.call(nativePerformance);
}

function shiftAndLockFakeClocks(deltaMs) {
  if (nativeHrtimeBigint) {
    hrtimeOffset += BigInt(deltaMs) * 1_000_000n;
    freezedHrtimeNs = nativeHrtimeBigint.call(nativeProcess) + hrtimeOffset;
  }
  if (nativePerformanceNow) {
    performanceNowOffset += deltaMs;
    freezedPerformanceNow = nativePerformanceNowFromHrtime() + performanceNowOffset;
  }
}

function fakeHrtimeNs() {
  if (freezedHrtimeNs !== null) return freezedHrtimeNs;
  return nativeHrtimeBigint.call(nativeProcess) + hrtimeOffset;
}

function fakeHrtime(prev) {
  const total = fakeHrtimeNs();
  const sec = Number(total / 1_000_000_000n);
  const ns = Number(total % 1_000_000_000n);
  if (!prev) return [sec, ns];
  let ds = sec - prev[0];
  let dn = ns - prev[1];
  if (dn < 0) {
    ds -= 1;
    dn += 1_000_000_000;
  }
  return [ds, dn];
}

fakeHrtime.bigint = function fakeHrtimeBigint() {
  return fakeHrtimeNs();
};

function fakePerformanceNow() {
  if (freezedPerformanceNow !== null) return freezedPerformanceNow;
  return nativePerformanceNowFromHrtime() + performanceNowOffset;
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
