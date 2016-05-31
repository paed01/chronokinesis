'use strict';

const _ = {
  cloneDeep: require('lodash.clonedeep'),
  assign: require('lodash.assign')
};
const NativeDate = Date;
const expect = require('code').expect;
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const moment = require('moment');

const ck = require('..');

lab.experiment('chronokinesis', () => {
  lab.experiment('#freeze', () => {
    lab.afterEach(ck.reset);

    lab.test('stops time', (done) => {
      const now = new Date();
      ck.freeze(now);
      setTimeout(() => {
        expect((new Date()).getTime()).to.equal(now.getTime());
        done();
      }, 10);
    });

    lab.test('can be used again', (done) => {
      const now = new Date();
      ck.freeze(now);

      const again = new Date('2015-12-12');

      ck.freeze(again);

      setTimeout(() => {
        expect((new Date()).getTime()).to.equal(again.getTime());
        done();
      }, 10);
    });

    lab.test('is not affected when a date is manipulated', (done) => {
      const now = new Date();
      ck.freeze(now);

      setTimeout(() => {
        const dateObj = new Date();
        const hour = dateObj.getUTCHours() + 1;
        dateObj.setUTCHours(hour);

        expect(dateObj.getUTCHours()).to.equal(hour);
        expect((new Date()).getTime()).to.equal(now.getTime());

        done();
      }, 10);
    });

    lab.test('when used without argument uses now', (done) => {
      ck.freeze();

      const dateObj = new Date();

      setTimeout(() => {
        expect((new Date()).getTime()).to.equal(dateObj.getTime());
        done();
      }, 10);
    });

    lab.test('Date.now is frozen', (done) => {
      const freezed = ck.freeze();

      setTimeout(() => {
        expect(Date.now()).to.equal(freezed.getTime());
        done();
      }, 10);
    });

    lab.test('without arguments while time traveling freezes at traveled point in time', (done) => {
      const traveledTo = ck.travel(1982, 5, 25, 10, 10, 10, 10);
      const freeze = ck.freeze();

      setTimeout(() => {
        expect(freeze.getTime()).to.be.about(traveledTo.getTime(), 1000);
        done();
      }, 10);
    });

    lab.test('with arguments while time traveling freezes at defined time', (done) => {
      ck.travel(1982, 5, 25, 10, 10, 10, 10);
      const freeze = ck.freeze(1980, 0, 1);

      setTimeout(() => {
        expect(freeze.getTime()).to.be.about(freeze.getTime(), 1000);
        done();
      }, 10);
    });

    lab.test('with FakeDate', (done) => {
      const traveled = ck.travel(1982, 5, 25, 10, 10, 10, 10);
      const freeze = ck.freeze(new Date());

      setTimeout(() => {
        expect(freeze.getTime()).to.be.about(traveled.getTime(), 1000);
        done();
      }, 10);
    });
  });

  lab.experiment('#defrost', () => {
    lab.afterEach(ck.reset);

    lab.test('starts ticking but is still in timekeeping mode', (done) => {
      const freeze = ck.freeze(1980, 1, 1);

      ck.defrost();

      setTimeout(() => {
        expect((new Date()).getTime()).to.be.above(freeze.getTime());
        expect(ck.isKeepingTime()).to.be.true();
        done();
      }, 10);
    });

    lab.test('starts ticking traveled time', (done) => {
      ck.freeze(1982, 5, 25);
      const traveled = ck.travel(1982, 5, 25, 10, 10, 10, 10).getTime();

      ck.defrost();

      setTimeout(() => {
        expect((new Date()).getTime()).to.be.above(traveled);
        expect((new Date()).getTime()).to.be.about(traveled, 1000);
        done();
      }, 10);
    });
  });

  lab.experiment('#travel', () => {
    let now;
    lab.beforeEach((done) => {
      now = new Date();
      done();
    });
    lab.afterEach(ck.reset);

    lab.test('travels forwards', (done) => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() + 2;
      dateObj.setUTCFullYear(year);

      ck.travel(dateObj);

      expect((new Date()).getUTCFullYear()).to.be.above(now.getUTCFullYear());
      done();
    });

    lab.test('and backwards', (done) => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() - 2;
      dateObj.setUTCFullYear(year);

      ck.travel(dateObj);

      expect((new Date()).getUTCFullYear()).to.be.below(now.getUTCFullYear());
      done();
    });

    lab.test('with arguments', (done) => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() - 2;
      dateObj.setUTCFullYear(year);

      ck.travel('1970-01-01T01:01:01Z');

      expect((new Date()).getUTCFullYear()).to.be.equal(1970);

      ck.travel(1980, 11, 24);

      expect((new Date()).getUTCFullYear()).to.be.equal(1980);

      done();
    });

    lab.test('without arguments does just about nothing', (done) => {
      ck.travel();

      expect((new Date()).getUTCFullYear()).to.be.equal(now.getUTCFullYear());
      done();
    });

    lab.test('Date.now has traveled', (done) => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() - 3;
      dateObj.setUTCFullYear(year);

      ck.travel(dateObj);

      setTimeout(() => {
        expect(Date.now()).to.be.above(dateObj.getTime());
        done();
      }, 10);
    });

    lab.test('frozen time refreezes time', (done) => {
      ck.freeze(1981, 5, 19);
      const traveledTo = ck.travel(1982, 5, 25, 10, 10, 10, 10);

      setTimeout(() => {
        expect((new Date()).getTime()).to.equal(traveledTo.getTime());
        done();
      }, 10);
    });

    lab.test('with FakeDate', (done) => {
      const freeze = ck.freeze(1980, 0, 1);
      const traveled = ck.travel(new Date());

      setTimeout(() => {
        expect(traveled.getTime()).to.equal(freeze.getTime());
        done();
      }, 10);
    });

  });

  lab.experiment('#isKeepingTime', () => {
    lab.afterEach(ck.reset);

    lab.test('returns true when frozen', (done) => {
      ck.freeze();
      expect(ck.isKeepingTime()).to.be.true();
      done();
    });

    lab.test('returns true when traveled', (done) => {
      ck.travel('1972-1-1');
      expect(ck.isKeepingTime()).to.be.true();
      done();
    });

    lab.test('but false when reset', (done) => {
      expect(ck.isKeepingTime()).to.be.false();
      done();
    });
  });

  lab.experiment('#reset', () => {
    lab.afterEach(ck.reset);

    lab.test('resets Date to native Date', (done) => {
      expect(Date).to.equal(NativeDate);
      ck.freeze();
      expect(Date).to.not.equal(NativeDate);

      ck.reset();

      expect(Date).to.equal(NativeDate);

      expect(Date.constructor).to.equal(NativeDate.constructor);
      expect(Date.constructor.prototype).to.equal(NativeDate.constructor.prototype);

      expect(new Date()).to.be.instanceOf(NativeDate).and.not.a.function();

      done();
    });

    lab.test('after reset in combination with lodash cloneDeep returns native Date', (done) => {
      const content = _.assign(_.cloneDeep({
        d: new Date()
      }));
      expect(content.d).to.not.be.a.function().and.instanceOf(NativeDate);
      done();
    });

    lab.test('resets frozen time', (done) => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() + 2;
      dateObj.setUTCFullYear(year);

      const freeze = ck.freeze(dateObj);
      ck.reset();
      expect((new Date()).getUTCFullYear()).to.be.below(freeze.getUTCFullYear());
      expect(Date.now()).to.be.below(freeze.getTime());
      done();
    });

    lab.test('resets traveled time', (done) => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() + 2;
      dateObj.setUTCFullYear(year);

      ck.travel(dateObj);
      ck.reset();
      expect((new Date()).getUTCFullYear()).to.be.below(dateObj.getUTCFullYear());
      expect(Date.now()).to.be.below(dateObj.getTime());
      done();
    });
  });

  lab.experiment('FakeDate', () => {
    lab.afterEach(ck.reset);

    lab.experiment('#ctor', () => {
      lab.test('without arguments returns date', (done) => {
        ck.freeze();
        expect(new Date()).to.be.instanceOf(Date);
        done();
      });

      lab.test('with milliseconds returns date', (done) => {
        ck.freeze();
        const fakeDate = new Date(378691200000);
        expect(fakeDate.getUTCFullYear()).to.equal(1982);
        done();
      });

      lab.test('with string returns date', (done) => {
        ck.freeze();
        const fakeDate = new Date('1982-07-01');
        expect(fakeDate.getUTCFullYear()).to.equal(1982);
        done();
      });

      lab.test('with year, month, and day returns date', (done) => {
        ck.freeze();

        const fakeDate = new Date(1923, 7, 1);
        expect(fakeDate.getFullYear()).to.equal(1923);
        expect(fakeDate.getMonth()).to.equal(7);
        expect(fakeDate.getDate()).to.equal(1);

        done();
      });

      lab.test('with time parts in constructor returns expected time', (done) => {
        ck.freeze();

        const fakeDate = new Date(1923, 7, 1, 10, 40, 59, 2);
        expect(fakeDate.getHours()).to.equal(10);
        expect(fakeDate.getMinutes()).to.equal(40);
        expect(fakeDate.getSeconds()).to.equal(59);
        expect(fakeDate.getMilliseconds()).to.equal(2);

        done();
      });

    });

    lab.experiment('parse', () => {
      lab.test('returns milliseconds', (done) => {
        ck.freeze();
        expect(Date.parse('1/1/1970')).to.be.a.number();
        done();
      });

      lab.test('or NaN if invalid date', (done) => {
        ck.freeze();

        const result = Date.parse('13/13/1970');

        expect(isNaN(result)).to.be.true();
        done();
      });
    });

    lab.experiment('UTC', () => {
      lab.test('UTC returns milliseconds', (done) => {
        ck.freeze();
        expect(Date.UTC(1923, 7, 1, 10, 40, 59, 1)).to.be.below(0);
        expect(Date.UTC(1923, 7, 1, 10, 40, 59)).to.be.below(0);
        expect(Date.UTC(1923, 7, 1, 10, 40)).to.be.below(0);
        expect(Date.UTC(1923, 7, 1, 10)).to.be.below(0);
        expect(Date.UTC(1923, 7, 1)).to.be.below(0);
        expect(Date.UTC(1923, 7)).to.be.below(0);
        done();
      });

      lab.test('UTC combined with FakeDate return defined utc date', (done) => {
        ck.freeze();

        const utcDate = new Date(Date.UTC(1982, 0, 1));
        expect(utcDate.getUTCFullYear()).to.equal(1982);
        done();
      });
    });

    lab.experiment('prototype', () => {
      lab.test('expected instance functions exists', (done) => {
        ck.freeze();

        const fakeDate = new Date();

        expect(fakeDate.getDate, 'getDate').to.be.a.function();
        expect(fakeDate.getDay, 'getDay').to.be.a.function();
        expect(fakeDate.getFullYear, 'getFullYear').to.be.a.function();
        expect(fakeDate.getHours, 'getHours').to.be.a.function();
        expect(fakeDate.getMilliseconds, 'getMilliseconds').to.be.a.function();
        expect(fakeDate.getMinutes, 'getMinutes').to.be.a.function();
        expect(fakeDate.getMonth, 'getMonth').to.be.a.function();
        expect(fakeDate.getSeconds, 'getSeconds').to.be.a.function();
        expect(fakeDate.getTime, 'getTime').to.be.a.function();
        expect(fakeDate.getTimezoneOffset, 'getTimezoneOffset').to.be.a.function();
        expect(fakeDate.getUTCDate, 'getUTCDate').to.be.a.function();
        expect(fakeDate.getUTCDay, 'getUTCDay').to.be.a.function();
        expect(fakeDate.getUTCFullYear, 'getUTCFullYear').to.be.a.function();
        expect(fakeDate.getUTCHours, 'getUTCHours').to.be.a.function();
        expect(fakeDate.getUTCMilliseconds, 'getUTCMilliseconds').to.be.a.function();
        expect(fakeDate.getUTCMinutes, 'getUTCMinutes').to.be.a.function();
        expect(fakeDate.getUTCMonth, 'getUTCMonth').to.be.a.function();
        expect(fakeDate.getUTCSeconds, 'getUTCSeconds').to.be.a.function();
        expect(fakeDate.getYear, 'getYear').to.be.a.function();
        expect(fakeDate.setDate, 'setDate').to.be.a.function();
        expect(fakeDate.setFullYear, 'setFullYear').to.be.a.function();
        expect(fakeDate.setHours, 'setHours').to.be.a.function();
        expect(fakeDate.setMilliseconds, 'setMilliseconds').to.be.a.function();
        expect(fakeDate.setMinutes, 'setMinutes').to.be.a.function();
        expect(fakeDate.setMonth, 'setMonth').to.be.a.function();
        expect(fakeDate.setSeconds, 'setSeconds').to.be.a.function();
        expect(fakeDate.setTime, 'setTime').to.be.a.function();
        expect(fakeDate.setUTCDate, 'setUTCDate').to.be.a.function();
        expect(fakeDate.setUTCFullYear, 'setUTCFullYear').to.be.a.function();
        expect(fakeDate.setUTCHours, 'setUTCHours').to.be.a.function();
        expect(fakeDate.setUTCMilliseconds, 'setUTCMilliseconds').to.be.a.function();
        expect(fakeDate.setUTCMinutes, 'setUTCMinutes').to.be.a.function();
        expect(fakeDate.setUTCMonth, 'setUTCMonth').to.be.a.function();
        expect(fakeDate.setUTCSeconds, 'setUTCSeconds').to.be.a.function();
        expect(fakeDate.setYear, 'setYear').to.be.a.function();
        expect(fakeDate.toDateString, 'toDateString').to.be.a.function();
        expect(fakeDate.toGMTString, 'toGMTString').to.be.a.function();
        expect(fakeDate.toISOString, 'toISOString').to.be.a.function();
        expect(fakeDate.toJSON, 'toJSON').to.be.a.function();
        expect(fakeDate.toLocaleDateString, 'toLocaleDateString').to.be.a.function();
        expect(fakeDate.toLocaleString, 'toLocaleString').to.be.a.function();
        expect(fakeDate.toLocaleTimeString, 'toLocaleTimeString').to.be.a.function();
        expect(fakeDate.toString, 'toString').to.be.a.function();
        expect(fakeDate.toTimeString, 'toTimeString').to.be.a.function();
        expect(fakeDate.toUTCString, 'toUTCString').to.be.a.function();
        expect(fakeDate.valueOf, 'valueOf').to.be.a.function();

        done();
      });
    });
  });

  lab.experiment('Other time dependant functionality', () => {
    let isReset = false;
    lab.beforeEach((done) => {
      isReset = false;
      done();
    });

    lab.afterEach((done) => {
      ck.reset(() => {
        isReset = true;
        done();
      });
    });

    lab.experiment('setTimeout', () => {
      lab.test('has expected behavior', (done) => {
        ck.freeze();
        setTimeout(() => {
          expect(isReset).to.be.false();
          done();
        }, 10);
      });
    });

    lab.experiment('setImmediate', () => {
      lab.test('has expected behavior', (done) => {
        ck.freeze();
        setImmediate(() => {
          expect(isReset).to.be.false();
          done();
        });
      });
    });

    lab.experiment('setInterval', () => {
      lab.test('has expected behavior', (done) => {
        ck.freeze();

        let count = 2;

        const ptr = setInterval(atInterval, 10);
        function atInterval() {
          if (count === 0) {
            clearInterval(ptr);
            done();
          }

          expect(isReset).to.be.false();

          count--;
        }
      });
    });
  });

  lab.experiment('moment', () => {
    lab.afterEach(ck.reset);

    lab.test('frozen format has expected behavior', (done) => {
      ck.freeze(1980, 0, 1);
      setTimeout(() => {
        expect(moment().format('YYYY-MM-DD')).to.equal('1980-01-01');
        done();
      }, 10);
    });

    lab.test('traveled format has expected behavior', (done) => {
      ck.travel(1981, 0, 1);
      setTimeout(() => {
        expect(moment().format('YYYY-MM-DD')).to.equal('1981-01-01');
        done();
      }, 10);
    });

    lab.test('travels when used as argument', (done) => {
      const momentDate = moment().add(7, 'days');

      ck.travel(momentDate);

      expect((new Date()).getTime()).to.be.about(momentDate.valueOf(), 1000);
      done();
    });

    lab.test('freezes when used as argument', (done) => {
      const momentDate = moment().subtract(1, 'day');

      ck.freeze(momentDate);

      setTimeout(() => {
        expect((new Date()).getTime()).to.equal(momentDate.valueOf());
        done();
      }, 10);
    });
  });
});
