import * as ck from 'chronokinesis';

const NativeDate = Date;
const nativeHrtime = process.hrtime;
const nativeHrtimeBigint = process.hrtime.bigint;
const nativePerformanceNow = performance.now;

describe('chronokinesis high-resolution clocks', () => {
  afterEach(ck.reset);

  describe('#process.hrtime', () => {
    it('is restored to native reference after reset', () => {
      ck.freeze();
      ck.reset();
      expect(process.hrtime).to.equal(nativeHrtime);
      expect(process.hrtime.bigint).to.equal(nativeHrtimeBigint);
    });

    it('is swapped while keeping time', () => {
      ck.freeze();
      expect(process.hrtime).to.not.equal(nativeHrtime);
    });

    it('bigint returns the same value on repeated calls while frozen', () => {
      ck.freeze();
      const first = process.hrtime.bigint();
      const second = process.hrtime.bigint();
      expect(second).to.equal(first);
    });

    it('tuple form agrees with bigint form', () => {
      ck.freeze('1980-01-01');
      const [sec, ns] = process.hrtime();
      const big = process.hrtime.bigint();
      expect(BigInt(sec) * 1_000_000_000n + BigInt(ns)).to.equal(big);
    });

    it('tuple form with prev returns zero diff while frozen', () => {
      ck.freeze('1980-01-01');
      const prev = process.hrtime();
      const diff = process.hrtime(prev);
      expect(diff[0]).to.equal(0);
      expect(diff[1]).to.equal(0);
    });

    it('tuple diff wraps when prev nanoseconds exceed current nanoseconds', () => {
      ck.freeze('1980-01-01T00:00:05.000Z');
      const [sec, ns] = process.hrtime();
      const prev = [sec - 1, ns + 500_000_000];
      const [dsec, dns] = process.hrtime(prev);
      expect(dsec).to.equal(0);
      expect(dns).to.equal(500_000_000);
    });

    it('ticks forward while travelling', () => {
      ck.travel('1980-01-01');
      const first = process.hrtime.bigint();
      return postpone(() => {
        const second = process.hrtime.bigint();
        expect(second > first).to.be.true;
      }, 20);
    });

    it('is strictly monotonic under travel across ms boundaries', () => {
      ck.travel('2050-01-01');
      let prev = process.hrtime.bigint();
      for (let i = 0; i < 200_000; i++) {
        const curr = process.hrtime.bigint();
        if (curr < prev) throw new Error(`regression at iteration ${i}: ${prev} -> ${curr} (delta ${prev - curr}ns)`);
        prev = curr;
      }
    });

    it('freeze(T) shifts hrtime by (T - now) * 1e6 ns relative to pre-mock base', () => {
      const baseHr = process.hrtime.bigint();
      const deltaMs = 60_000;
      ck.freeze(new NativeDate(NativeDate.now() + deltaMs));
      const diffNs = Number(process.hrtime.bigint() - baseHr);
      // Real elapsed time between the two reads is microseconds; tolerance 100ms
      expect(diffNs).to.be.within(deltaMs * 1_000_000 - 5_000_000, deltaMs * 1_000_000 + 100_000_000);
    });

    it('returns real hrtime after reset (monotonic, not wall-clock)', () => {
      ck.freeze('1980-01-01');
      ck.reset();
      const ns = process.hrtime.bigint();
      const wallNs = BigInt(Date.now()) * 1_000_000n;
      expect(ns < wallNs).to.be.true;
    });

    it('passes through to native hrtime when frozen then defrosted without travel', () => {
      ck.freeze();
      ck.defrost();
      const ns = process.hrtime.bigint();
      const wallNs = BigInt(NativeDate.now()) * 1_000_000n;
      expect(ns < wallNs).to.be.true;
    });
  });

  describe('#performance.now', () => {
    it('is restored to native reference after reset', () => {
      ck.freeze();
      ck.reset();
      expect(performance.now).to.equal(nativePerformanceNow);
    });

    it('returns the same value on repeated calls while frozen', () => {
      ck.freeze();
      const first = performance.now();
      const second = performance.now();
      expect(second).to.equal(first);
    });

    it('freeze(T) shifts performance.now by (T - now) ms relative to pre-mock base', () => {
      const basePerf = performance.now();
      const deltaMs = 60_000;
      ck.freeze(new NativeDate(NativeDate.now() + deltaMs));
      const diffMs = performance.now() - basePerf;
      expect(diffMs).to.be.within(deltaMs - 5, deltaMs + 100);
    });

    it('ticks forward while travelling', () => {
      ck.travel('2050-01-01');
      const first = performance.now();
      return postpone(() => {
        const second = performance.now();
        expect(second > first).to.be.true;
      }, 20);
    });

    it('is strictly monotonic under travel across ms boundaries', () => {
      ck.travel('2050-01-01');
      let prev = performance.now();
      for (let i = 0; i < 200_000; i++) {
        const curr = performance.now();
        if (curr < prev) throw new Error(`regression at iteration ${i}: ${prev} -> ${curr}`);
        prev = curr;
      }
    });

    it('passes through to native perf.now when frozen then defrosted without travel', () => {
      ck.freeze();
      ck.defrost();
      const a = performance.now();
      const b = performance.now();
      expect(b >= a).to.be.true;
      expect(a).to.be.above(0);
    });
  });

  describe('coupling to Date via freeze + travel', () => {
    it('diff between pre-mock base and (freeze + travel +1s) is close to 1 second', () => {
      // Capture base high-resolution values BEFORE any mocking
      const baseHr = process.hrtime.bigint();
      const basePerf = performance.now();
      const baseMs = NativeDate.now();

      ck.freeze(baseMs);
      ck.travel(baseMs + 1000);

      const diffHrNs = Number(process.hrtime.bigint() - baseHr);
      const diffPerfMs = performance.now() - basePerf;

      // Expect ~1 second, with tolerance for real elapsed wall-clock time during setup (microseconds to tens of ms)
      expect(diffHrNs).to.be.within(1_000_000_000 - 5_000_000, 1_000_000_000 + 50_000_000);
      expect(diffPerfMs).to.be.within(1000 - 5, 1000 + 50);
    });
  });
});

function postpone(fn, ms, ...args) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fn(...args));
    }, ms);
  });
}
