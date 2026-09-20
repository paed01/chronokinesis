import * as ck from 'chronokinesis';

describe('chronokinesis Temporal.Now', () => {
  const nativeNow = snapshot(Temporal.Now);
  const nativeKeys = Object.keys(Temporal.Now);

  afterEach(ck.reset);

  it('is restored to native references after reset', () => {
    ck.freeze();
    ck.reset();
    for (const [key, fn] of Object.entries(nativeNow)) {
      expect(Temporal.Now[key], key).to.equal(fn);
    }
  });

  it('preserves method property enumerability while mocked and after reset', () => {
    ck.freeze();
    expect(Object.keys(Temporal.Now)).to.deep.equal(nativeKeys);
    ck.reset();
    expect(Object.keys(Temporal.Now)).to.deep.equal(nativeKeys);
  });

  it('is swapped while keeping time', () => {
    ck.freeze();
    expect(Temporal.Now.instant).to.not.equal(nativeNow.instant);
  });

  it('instant() follows freeze', () => {
    const frozen = ck.freeze('1980-01-01T12:00:00Z');
    expect(Temporal.Now.instant().epochMilliseconds).to.equal(frozen.getTime());
    expect(Temporal.Now.instant().epochMilliseconds).to.equal(frozen.getTime());
  });

  it('instant() agrees with Date.now while frozen', () => {
    ck.freeze('1980-01-01T12:00:00Z');
    expect(Temporal.Now.instant().epochMilliseconds).to.equal(Date.now());
  });

  it('instant() ticks forward while travelling', () => {
    ck.travel('2050-01-01');
    const first = Temporal.Now.instant();
    return postpone(() => {
      const second = Temporal.Now.instant();
      expect(Temporal.Instant.compare(second, first)).to.equal(1);
      expect(second.epochMilliseconds - first.epochMilliseconds).to.be.within(1, 1000);
    }, 20);
  });

  it('instant() follows travel after freeze', () => {
    ck.freeze('1980-01-01T12:00:00Z');
    ck.travel('2050-06-15T00:00:00Z');
    expect(Temporal.Now.instant().toString()).to.equal('2050-06-15T00:00:00Z');
    expect(Temporal.Now.instant().toString()).to.equal('2050-06-15T00:00:00Z');
  });

  it('zonedDateTimeISO(tz) reflects frozen instant in requested zone', () => {
    ck.freeze('1980-01-01T12:00:00Z');
    const zdt = Temporal.Now.zonedDateTimeISO('Asia/Tokyo');
    expect(zdt.timeZoneId).to.equal('Asia/Tokyo');
    expect(zdt.toString()).to.equal('1980-01-01T21:00:00+09:00[Asia/Tokyo]');
  });

  it('plainDateTimeISO, plainDateISO and plainTimeISO reflect frozen instant', () => {
    ck.freeze('1980-01-01T12:34:56Z');
    expect(Temporal.Now.plainDateTimeISO('UTC').toString()).to.equal('1980-01-01T12:34:56');
    expect(Temporal.Now.plainDateISO('UTC').toString()).to.equal('1980-01-01');
    expect(Temporal.Now.plainTimeISO('UTC').toString()).to.equal('12:34:56');
  });

  it('timeZoneId() is native when no timezone travel is active', () => {
    ck.freeze();
    expect(Temporal.Now.timeZoneId()).to.equal(nativeNow.timeZoneId());
  });

  it('timeZoneId() and zone-less methods honour timezone travel', () => {
    ck.timezone('Asia/Tokyo').freeze('1980-01-01T12:00:00Z');
    expect(Temporal.Now.timeZoneId()).to.equal('Asia/Tokyo');

    const zdt = Temporal.Now.zonedDateTimeISO();
    expect(zdt.timeZoneId).to.equal('Asia/Tokyo');
    expect(zdt.epochMilliseconds).to.equal(Date.now());
    expect(Temporal.Now.plainDateTimeISO().toString()).to.equal(zdt.toPlainDateTime().toString());
    expect(Temporal.Now.plainDateISO().toString()).to.equal(zdt.toPlainDate().toString());
    expect(Temporal.Now.plainTimeISO().toString()).to.equal(zdt.toPlainTime().toString());
  });

  it('explicit zone argument wins over timezone travel', () => {
    ck.timezone('Asia/Tokyo').freeze('1980-01-01T12:00:00Z');
    expect(Temporal.Now.zonedDateTimeISO('Europe/Stockholm').timeZoneId).to.equal('Europe/Stockholm');
  });

  it('wall clock in travelled zone equals the arguments passed to timezone freeze', () => {
    ck.timezone('America/New_York').freeze(2024, 2, 10, 1, 30);
    const zdt = Temporal.Now.zonedDateTimeISO();
    expect(zdt.toPlainDateTime().toString()).to.equal('2024-03-10T01:30:00');
    expect(zdt.offset).to.equal('-05:00');
    expect(zdt.epochMilliseconds).to.equal(Date.now());
    expect(new Date().getTimezoneOffset()).to.equal(300);
  });

  it('wall clock in travelled zone follows DST when travelling', () => {
    ck.timezone('America/New_York').travel(2024, 2, 10, 1, 59, 59);
    expect(Temporal.Now.zonedDateTimeISO().offset).to.equal('-05:00');
    ck.travel(Date.now() + 1000);
    const zdt = Temporal.Now.zonedDateTimeISO();
    expect(zdt.offset).to.equal('-04:00');
    expect(zdt.hour).to.equal(3);
  });

  it('a held reference to Temporal.Now sees the mock', () => {
    const { Now } = Temporal;
    ck.freeze('1980-01-01T12:00:00Z');
    expect(Now.instant().epochMilliseconds).to.equal(Date.now());
    ck.reset();
    expect(Now.instant().epochMilliseconds).to.be.above(new Date('2026-01-01').getTime());
  });

  it('returns real time after reset', () => {
    ck.freeze('1980-01-01');
    ck.reset();
    expect(Temporal.Now.instant().epochMilliseconds).to.be.above(new Date('2026-01-01').getTime());
  });

  it('is restored when freeze throws on invalid date', () => {
    expect(() => ck.freeze('invalid')).to.throw(TypeError);
    expect(Temporal.Now.instant).to.equal(nativeNow.instant);
  });
});

function snapshot(Now) {
  const result = {};
  for (const key of Object.getOwnPropertyNames(Now)) {
    if (typeof Now[key] === 'function') result[key] = Now[key];
  }
  return result;
}

function postpone(fn, ms, ...args) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fn(...args));
    }, ms);
  });
}
