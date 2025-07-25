import * as ck from 'chronokinesis';

const NativeDate = Date;

describe('chronokinesis timezone', () => {
  after(ck.reset);

  describe('#timezone', () => {
    it('exposes the same api and some', () => {
      const cktz = ck.timezone('Europe/Stockholm');
      expect(cktz.timeZone).to.equal('Europe/Stockholm');
      expect(cktz.freeze).to.be.a('function');
      expect(cktz.travel).to.be.a('function');
      expect(cktz.isKeepingTime).to.be.a('function');
      expect(cktz.timezone).to.be.undefined;
    });

    it('throws if timezone is unresolved', () => {
      expect(() => ck.timezone('Moon/Crater')).to.throw(RangeError, /Moon\/Crater/i);
    });

    it('immediately starts travelling in time zone', () => {
      ck.timezone('Europe/Helsinki');
      expect(ck.isKeepingTime()).to.be.true;
      const fdate = new Date();

      ck.timezone('Europe/Stockholm');
      expect(ck.isKeepingTime()).to.be.true;
      const sdate = new Date();

      expect(sdate.getHours() - fdate.getHours()).to.be.above(0);
    });

    it('arguments are passed to time zone travel function', () => {
      const utc = Date.UTC(2021, 7, 26, 18, 0);

      ck.timezone('Europe/Helsinki', 2021, 7, 26, 18, 0);
      const fdate = new Date();

      ck.timezone('Europe/Stockholm', 2021, 7, 26, 18, 0);
      const sdate = new Date();

      expect(diffHrs(utc, fdate), 'Finland').to.equal(-3);
      expect(diffHrs(utc, sdate), 'Sweden').to.equal(-2);

      expect(diffHrs(fdate, sdate)).to.equal(1);
    });
  });

  describe('#freeze in timezone', () => {
    beforeEach(ck.reset);
    it('with arguments freezes at specified time in timezone', () => {
      const utc = Date.UTC(2021, 7, 26, 15, 0);

      const tzFinland = ck.timezone('Europe/Helsinki');
      tzFinland.freeze(2021, 7, 26, 18, 0);
      expect(diffHrs(utc, new Date())).to.equal(0);

      const tzSweden = ck.timezone('Europe/Stockholm');
      tzSweden.freeze(2021, 7, 26, 17, 0);
      expect(diffHrs(utc, new Date())).to.equal(0);

      const tzLA = ck.timezone('America/Los_Angeles');
      tzLA.freeze(2021, 7, 26, 8, 0);
      expect(diffHrs(utc, new Date())).to.equal(0);

      const tzShanghai = ck.timezone('Asia/Shanghai');
      tzShanghai.freeze(2021, 7, 26, 23, 0);
      expect(diffHrs(utc, new Date())).to.equal(0);
    });

    it('without arguments freezes moves now to timezone', () => {
      const utc = Date.now();

      const tzLA = ck.timezone('America/Los_Angeles');
      tzLA.freeze();
      expect(diffHrs(utc, new Date()), 'LA', new Date().toISOString() + ' -> ' + new Date(utc).toISOString()).to.be.closeTo(-7, 1);

      ck.reset();
      const tzShanghai = ck.timezone('Asia/Shanghai');
      tzShanghai.freeze();
      expect(diffHrs(utc, new Date()), 'Shanghai').to.equal(8);

      ck.reset();
      const tzFinland = ck.timezone('Europe/Helsinki');
      tzFinland.freeze();
      expect(diffHrs(utc, new Date()), 'Finland').to.be.within(2, 3);

      ck.reset();
      const tzSweden = ck.timezone('Europe/Stockholm');
      tzSweden.freeze();
      expect(diffHrs(utc, new Date()), 'Sweden').to.be.within(1, 2);
    });

    it('if already frozen moves now to timezone', () => {
      const utc = Date.now();

      const tzFinland = ck.timezone('Europe/Helsinki');
      tzFinland.freeze();
      expect(diffHrs(utc, new Date()), 'Finland').to.be.within(2, 3);

      const tzSweden = ck.timezone('Europe/Stockholm');
      tzSweden.freeze();
      expect(diffHrs(utc, new Date()), 'Sweden').to.closeTo(4, 1);
    });

    it('returns date adjusted to timezone', () => {
      const utc = Date.UTC(2021, 7, 26, 18, 0);

      const tzFinland = ck.timezone('Europe/Helsinki');
      const tzSweden = ck.timezone('Europe/Stockholm');
      const tzLA = ck.timezone('America/Los_Angeles');
      const tzShanghai = ck.timezone('Asia/Shanghai');

      const fdate = tzFinland.freeze(2021, 7, 26, 18, 0);
      const sdate = tzSweden.freeze(2021, 7, 26, 18, 0);
      const ldate = tzLA.freeze(2021, 7, 26, 18, 0);
      const adate = tzShanghai.freeze(2021, 7, 26, 18, 0);

      expect(diffHrs(utc, fdate), 'Finland').to.equal(-3);
      expect(diffHrs(utc, sdate), 'Sweden').to.equal(-2);
      expect(diffHrs(utc, ldate), 'LA').to.equal(7);
      expect(diffHrs(utc, adate), 'Shanghai').to.equal(-8);

      expect(diffHrs(fdate, sdate)).to.equal(1);
    });

    it('returns date adjusted to timezone with daylight saving', () => {
      const utc = Date.UTC(2021, 2, 26, 18, 0);

      const tzFinland = ck.timezone('Europe/Helsinki');
      const tzSweden = ck.timezone('Europe/Stockholm');
      const tzLA = ck.timezone('America/Los_Angeles');
      const tzShanghai = ck.timezone('Asia/Shanghai');

      const fdate = tzFinland.freeze(2021, 2, 26, 18, 0);
      const sdate = tzSweden.freeze(2021, 2, 26, 18, 0);
      const ldate = tzLA.freeze(2021, 2, 26, 18, 0);
      const adate = tzShanghai.freeze(2021, 2, 26, 18, 0);

      expect(diffHrs(utc, fdate), 'Finland').to.equal(-2);
      expect(diffHrs(utc, sdate), 'Sweden').to.equal(-1);
      expect(diffHrs(utc, ldate), 'LA').to.equal(7);
      expect(diffHrs(utc, adate), 'Shanghai').to.equal(-8);

      expect(diffHrs(fdate, sdate)).to.equal(1);
    });

    it('starts ticking when defrost is called', async () => {
      const utc = Date.UTC(2021, 2, 20, 0, 1, 0, 123);

      const tz = ck.timezone('Asia/Shanghai');
      tz.freeze(2021, 2, 20, 0, 1, 0, 123);
      expect(diffHrs(utc, new Date())).to.equal(-8);

      const before = Date.now();
      tz.defrost();

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(Date.now() - before).to.be.above(50);
    });

    it('works in combination with freeze', () => {
      const utc = Date.UTC(2021, 2, 27, 8, 1, 0, 123);
      ck.freeze(utc);

      const tz = ck.timezone('America/Los_Angeles');
      tz.freeze(2021, 2, 27, 8, 1, 0, 123);
      expect(diffHrs(utc, new Date())).to.equal(7);
    });

    it('freeze after freeze without arguments is ignored', () => {
      const utc = Date.now();
      const tz = ck.timezone('Asia/Shanghai');
      tz.freeze();
      expect(diffHrs(utc, new Date()), '1st').to.equal(8);
      tz.freeze();
      expect(diffHrs(utc, new Date()), '2nd').to.equal(8);
    });
  });

  describe('#travel in timezone', () => {
    beforeEach(ck.reset);

    it('returns date adjusted to timezone', () => {
      const utc = Date.UTC(2021, 7, 26, 18, 0);

      const tzFinland = ck.timezone('Europe/Helsinki');
      const tzSweden = ck.timezone('Europe/Stockholm');

      const fdate = tzFinland.travel(2021, 7, 26, 18, 0);
      const sdate = tzSweden.travel(2021, 7, 26, 18, 0);

      expect(diffHrs(utc, fdate), 'Finland').to.equal(-3);
      expect(diffHrs(utc, sdate), 'Sweden').to.equal(-2);

      expect(diffHrs(fdate, sdate)).to.equal(1);
    });

    it('returns date adjusted to timezone with daylight saving', () => {
      const utc = Date.UTC(2021, 2, 26, 18, 0);

      const tzFinland = ck.timezone('Europe/Helsinki');
      const tzSweden = ck.timezone('Europe/Stockholm');

      const fdate = tzFinland.travel(2021, 2, 26, 18, 0);
      const sdate = tzSweden.travel(2021, 2, 26, 18, 0);

      expect(diffHrs(utc, fdate), 'Finland').to.equal(-2);
      expect(diffHrs(utc, sdate), 'Sweden').to.equal(-1);

      expect(diffHrs(fdate, sdate)).to.equal(1);
    });

    it('with arguments travels at specified time in timezone', () => {
      const utc = Date.UTC(2021, 7, 26, 15, 0);

      const tzFinland = ck.timezone('Europe/Helsinki');
      tzFinland.travel(2021, 7, 26, 18, 0);
      expect(diffHrs(utc, new Date())).to.equal(0);

      const tzSweden = ck.timezone('Europe/Stockholm');
      tzSweden.travel(2021, 7, 26, 17, 0);
      expect(diffHrs(utc, new Date())).to.equal(0);

      const tzLA = ck.timezone('America/Los_Angeles');
      tzLA.travel(2021, 7, 26, 8, 0);
      expect(diffHrs(utc, new Date())).to.equal(0);

      const tzShanghai = ck.timezone('Asia/Shanghai');
      tzShanghai.travel(2021, 7, 26, 23, 0);
      expect(diffHrs(utc, new Date())).to.equal(0);
    });

    it('starts ticking when defrost is called', async () => {
      const utc = Date.UTC(2021, 2, 20, 0, 1, 0, 123);

      const tz = ck.timezone('Asia/Shanghai');
      tz.freeze(2021, 2, 20, 0, 1, 0, 123);
      expect(diffHrs(utc, new Date())).to.equal(-8);

      const before = Date.now();
      tz.defrost();

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(Date.now() - before).to.be.above(50);
    });

    it('works in combination with freeze', () => {
      const utc = Date.UTC(2021, 2, 27, 8, 1, 0, 123);
      ck.freeze(utc);

      const tz = ck.timezone('America/Los_Angeles');
      tz.freeze(2021, 2, 27, 8, 1, 0, 123);
      expect(diffHrs(utc, new Date())).to.equal(7);
    });

    it('still travels', async () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);

      const tz = ck.timezone('America/Los_Angeles');
      tz.travel(2021, 2, 20, 0, 1, 0, 123);
      expect(diffHrs(dt, new Date())).to.equal(7);

      const before = Date.now();

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(Date.now() - before).to.be.above(50);

      expect(diffHrs(dt, new Date())).to.equal(7);
    });

    it('works in combination with timezone freeze', async () => {
      const utc = Date.UTC(2021, 2, 20, 0, 1, 0, 123);

      const tz = ck.timezone('Asia/Shanghai');
      tz.travel(2021, 2, 20, 0, 1, 0, 123);
      expect(diffHrs(utc, new Date())).to.equal(-8);

      const before = Date.now();

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      tz.freeze();

      expect(Date.now() - before).to.be.within(50, 200);
      expect(diffHrs(utc, new Date())).to.equal(-8);
    });

    it('works in combination with freeze', () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      ck.freeze(dt);

      const tz = ck.timezone('Asia/Shanghai');
      tz.travel();
      expect(diffHrs(dt, new Date())).to.equal(8);
    });

    it('works in combination with travel', () => {
      const dt = Date.UTC(2021, 2, 20, 0, 1, 0, 123);
      ck.travel(dt);

      const tz = ck.timezone('Asia/Shanghai');
      tz.travel();
      expect(diffHrs(dt, new Date())).to.equal(8);
    });

    it('travel after travel without arguments is ignored', () => {
      const utc = Date.now();
      const tz = ck.timezone('Asia/Shanghai');
      tz.travel();
      expect(diffHrs(utc, new Date()), '1st').to.equal(8);
      tz.travel();
      expect(diffHrs(utc, new Date()), '2nd').to.equal(8);
    });
  });

  describe('#getTimezoneOffset', () => {
    beforeEach(ck.reset);

    it('returns offset for current time zone', () => {
      ck.freeze();
      expect(new Date().getTimezoneOffset() - new NativeDate().getTimezoneOffset()).to.equal(0);
    });

    it('returns offset for faked time zone', () => {
      ck.timezone('Asia/Shanghai').freeze();
      const date = new Date();

      expect(date.getTimezoneOffset()).to.be.closeTo(-480, 60);

      ck.timezone('America/Los_Angeles').travel();
      expect(new Date().getTimezoneOffset()).to.be.closeTo(420, 60);
    });

    it('returns offset for faked time zone with daylight saving', () => {
      const tzSweden = ck.timezone('Europe/Stockholm');
      tzSweden.freeze(2021, 7, 26, 17, 0);
      expect(new Date().getTimezoneOffset()).to.equal(-120);
      tzSweden.freeze(2021, 2, 26, 17, 0);
      expect(new Date().getTimezoneOffset()).to.equal(-60);
    });
  });

  describe('#isKeepingTime', () => {
    beforeEach(ck.reset);

    it('returns true if froozen', () => {
      const fakeTz = ck.timezone('Asia/Shanghai');
      fakeTz.freeze();
      expect(fakeTz.isKeepingTime()).to.be.true;
      expect(ck.isKeepingTime()).to.be.true;
    });

    it('returns true if travleing', () => {
      const fakeTz = ck.timezone('Asia/Shanghai');
      fakeTz.travel();
      expect(fakeTz.isKeepingTime()).to.be.true;
      expect(ck.isKeepingTime()).to.be.true;
    });

    it('returns false if reset after traveling', () => {
      const fakeTz = ck.timezone('Asia/Shanghai');
      fakeTz.travel();
      expect(fakeTz.isKeepingTime()).to.be.true;
      expect(ck.isKeepingTime()).to.be.true;

      fakeTz.reset();

      expect(fakeTz.isKeepingTime()).to.be.false;
      expect(ck.isKeepingTime()).to.be.false;
    });
  });

  describe('new TimezoneTraveling(timeZone)', () => {
    it('returns the expected interface', () => {
      const cktz = new ck.TimeZoneTraveller('Europe/Stockholm');
      expect(cktz.timeZone).to.equal('Europe/Stockholm');
      expect(cktz.freeze).to.be.a('function');
      expect(cktz.defrost).to.be.a('function');
      expect(cktz.travel).to.be.a('function');
      expect(cktz.isKeepingTime).to.be.a('function');
      expect(cktz.getTime).to.be.a('function');
    });
  });
});

function diffHrs(dt, faked) {
  return Math.round((new NativeDate(faked).getTime() - new NativeDate(dt).getTime()) / 3600000);
}
