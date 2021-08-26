'use strict';

const Lab = require('@hapi/lab');
const {expect} = require('@hapi/code');

const NativeDate = Date;
const {beforeEach, after, describe, it} = exports.lab = Lab.script();

const ck = require('..');

describe('chronokinesis', () => {
  after(ck.reset);

  describe('#timezone', () => {
    it('exposes the same api and some', () => {
      const cktz = ck.timezone('Europe/Stockholm');
      expect(cktz.timeZone).to.equal('Europe/Stockholm');
      expect(cktz.freeze).to.be.function();
      expect(cktz.travel).to.be.function();
      expect(cktz.isKeepingTime).to.be.function();
      expect(cktz.getUTCOffset).to.be.function();
      expect(cktz.timezone).to.be.undefined();
    });

    it('throws if timezone is unresolved', () => {
      expect(() => ck.timezone('Moon/Crater')).to.throw(RangeError, 'Unsupported time zone specified Moon/Crater');
    });
  });

  describe('#freeze in timezone', () => {
    beforeEach(ck.reset);

    it('returns date in adjusted for timezone in timezone with daylight saving', () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      const dsdt = Date.UTC(2021, 7, 20, 0, 2, 0, 123);

      const tzSweden = ck.timezone('Europe/Stockholm');

      tzSweden.freeze(dt);
      expect(diffHrs(dt, new Date())).to.equal(1);

      tzSweden.freeze(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(2);

      const tzFinland = ck.timezone('Europe/Helsinki');
      tzFinland.freeze(dt);
      expect(diffHrs(dt, new Date())).to.equal(2);

      tzFinland.freeze(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(3);
    });

    it('returns date adjusted for Los Angeles', () => {
      const now = Date.now();
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      const dsdt = Date.UTC(2021, 7, 20, 0, 2, 0, 123);

      const tz = ck.timezone('America/Los_Angeles');
      tz.freeze(now);
      expect(diffHrs(now, new Date())).to.equal(-7);

      tz.freeze(dt);
      expect(diffHrs(dt, new Date())).to.equal(-7);

      tz.freeze(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(-7);
    });

    it('returns date adjusted for GMT/UTC', () => {
      const now = Date.now();
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      const dsdt = Date.UTC(2021, 7, 20, 0, 2, 0, 123);

      const tz = ck.timezone('UTC');
      tz.freeze(now);
      expect(diffHrs(now, new Date())).to.equal(0);

      tz.freeze(dt);
      expect(diffHrs(dt, new Date())).to.equal(0);

      tz.freeze(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(0);
    });

    it('returns date adjusted for Shanghai', () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      const dsdt = Date.UTC(2021, 7, 20, 0, 2, 0, 123);

      const tz = ck.timezone('Asia/Shanghai');
      tz.freeze(dt);
      expect(diffHrs(dt, new Date())).to.equal(8);

      tz.freeze(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(8);
    });

    it('really freezes date', async () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);

      const tz = ck.timezone('Asia/Shanghai');
      tz.freeze(dt);
      expect(diffHrs(dt, new Date())).to.equal(8);

      const before = Date.now();

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(Date.now()).to.equal(before);
    });

    it('starts ticking when defrost is called', async () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);

      const tz = ck.timezone('Asia/Shanghai');
      tz.freeze(dt);
      expect(diffHrs(dt, new Date())).to.equal(8);

      const before = Date.now();
      tz.defrost();

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(Date.now() - before).to.be.above(50);
    });

    it('works in combination with freeze', async () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      ck.freeze(dt);

      const tz = ck.timezone('Asia/Shanghai');
      tz.freeze(dt);
      expect(diffHrs(dt, new Date())).to.equal(8);
    });
  });

  describe('#travel in timezone', () => {
    beforeEach(ck.reset);

    it('returns date in adjusted for timezone in timezone with daylight saving', () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      const dsdt = Date.UTC(2021, 7, 20, 0, 2, 0, 123);

      const tzSweden = ck.timezone('Europe/Stockholm');

      tzSweden.travel(dt);
      expect(diffHrs(dt, new Date())).to.equal(1);

      tzSweden.travel(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(2);

      const tzFinland = ck.timezone('Europe/Helsinki');
      tzFinland.travel(dt);
      expect(diffHrs(dt, new Date())).to.equal(2);

      tzFinland.travel(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(3);
    });

    it('returns date adjusted for Los Angeles', () => {
      const now = Date.now();
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      const dsdt = Date.UTC(2021, 7, 20, 0, 2, 0, 123);

      const tz = ck.timezone('America/Los_Angeles');
      tz.travel(now);
      expect(diffHrs(now, new Date())).to.equal(-7);

      tz.travel(dt);
      expect(diffHrs(dt, new Date())).to.equal(-7);

      tz.travel(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(-7);
    });

    it('returns date adjusted for GMT/UTC', () => {
      const now = Date.now();
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      const dsdt = Date.UTC(2021, 7, 20, 0, 2, 0, 123);

      const tz = ck.timezone('UTC');
      tz.travel(now);
      expect(diffHrs(now, new Date())).to.equal(0);

      tz.travel(dt);
      expect(diffHrs(dt, new Date())).to.equal(0);

      tz.travel(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(0);
    });

    it('returns date adjusted for Shanghai', () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      const dsdt = Date.UTC(2021, 7, 20, 0, 2, 0, 123);

      const tz = ck.timezone('Asia/Shanghai');
      tz.travel(dt);
      expect(diffHrs(dt, new Date())).to.equal(8);

      tz.travel(dsdt);
      expect(diffHrs(dsdt, new Date())).to.equal(8);
    });

    it('still travels', async () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);

      const tz = ck.timezone('Asia/Shanghai');
      tz.travel(dt);
      expect(diffHrs(dt, new Date())).to.equal(8);

      const before = Date.now();

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(Date.now() - before).to.be.above(50);

      expect(diffHrs(dt, new Date())).to.equal(8);
    });

    it('works in combination with timezone freeze', async () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);

      const tz = ck.timezone('Asia/Shanghai');
      tz.travel(dt);
      expect(diffHrs(dt, new Date())).to.equal(8);

      const before = Date.now();

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      tz.freeze();

      expect(Date.now() - before).to.be.within(50, 200);
      expect(diffHrs(dt, new Date())).to.equal(8);
    });

    it('works in combination with freeze', async () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      ck.freeze(dt);

      const tz = ck.timezone('Asia/Shanghai');
      tz.travel(dt);
      expect(diffHrs(dt, new Date())).to.equal(8);
    });

    it('works in combination with travel', async () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      ck.travel(dt);

      const tz = ck.timezone('Asia/Shanghai');
      tz.travel();
      expect(diffHrs(dt, new Date())).to.equal(0);
    });
  });

  describe('#getUTCOffset in milliseconds', () => {
    beforeEach(ck.reset);

    it('returns offset in milliseconds if called without date', () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);

      ck.freeze(dt);
      expect(ck.timezone('Europe/Stockholm').getUTCOffset()).to.equal(3600000);
      expect(ck.timezone('Europe/Helsinki').getUTCOffset()).to.equal(2 * 3600000);

      const dsdt = Date.UTC(2021, 7, 20, 0, 2, 0, 123);
      ck.freeze(dsdt);

      expect(ck.timezone('Europe/Stockholm').getUTCOffset()).to.equal(2 * 3600000);
      expect(ck.timezone('Europe/Helsinki').getUTCOffset()).to.equal(3 * 3600000);
    });

    it('returns offset in milliseconds if called with date', () => {
      const dt = Date.UTC(2021, 9, 31, 0, 0, 0);
      const dsdt = new Date(dt + 2 * 3600000);

      expect(ck.timezone('Europe/Stockholm').getUTCOffset(new Date(dt)), 'daylight saving').to.equal(2 * 3600000);
      expect(ck.timezone('Europe/Stockholm').getUTCOffset(new Date(dt + 3600000)), 'daylight saving').to.equal(2 * 3600000);
      expect(ck.timezone('Europe/Stockholm').getUTCOffset(dsdt), 'outside daylight saving').to.equal(3600000);
    });
  });
});

function diffHrs(dt, faked) {
  return ~~((faked.getTime() - new NativeDate(dt).getTime()) / 3600000);
}
