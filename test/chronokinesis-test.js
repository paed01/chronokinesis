import cloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import { DateTime } from 'luxon';

import * as ck from 'chronokinesis';

const _ = {
  cloneDeep,
  assign: Object.assign,
};

const NativeDate = Date;

describe('chronokinesis', () => {
  describe('#freeze', () => {
    afterEach(ck.reset);

    it('stops time', () => {
      const now = new Date();
      ck.freeze(now);
      return postpone(() => {
        expect(new Date().getTime()).to.equal(now.getTime());
      }, 10);
    });

    it('can be used again', () => {
      const now = new Date();
      ck.freeze(now);

      const again = new Date('2015-12-12');

      ck.freeze(again);

      return postpone(() => {
        expect(new Date().getTime()).to.equal(again.getTime());
      }, 10);
    });

    it('is not affected when a date is manipulated', () => {
      const now = new Date();
      ck.freeze(now);

      return postpone(() => {
        const dateObj = new Date();
        const hour = dateObj.getUTCHours() + 1;
        dateObj.setUTCHours(hour);

        expect(dateObj.getUTCHours()).to.equal(hour);
        expect(new Date().getTime()).to.equal(now.getTime());
      }, 10);
    });

    it('when used without argument uses now', () => {
      ck.freeze();

      const dateObj = new Date();

      return postpone(() => {
        expect(new Date().getTime()).to.equal(dateObj.getTime());
      }, 10);
    });

    it('Date.now is frozen', () => {
      const freezed = ck.freeze();

      return postpone(() => {
        expect(Date.now()).to.equal(freezed.getTime());
      }, 10);
    });

    it('without arguments while time traveling freezes at traveled point in time', () => {
      const traveledTo = ck.travel(1982, 5, 25, 10, 10, 10, 10);
      const freeze = ck.freeze();

      return postpone(() => {
        const tt = traveledTo.getTime();
        expect(freeze.getTime())
          .to.be.above(tt - 1)
          .and.below(tt + 1000);
      }, 10);
    });

    it('with arguments while time traveling freezes at defined time', () => {
      ck.travel(1982, 5, 25, 10, 10, 10, 10);
      const freeze = ck.freeze(1980, 0, 1);

      return postpone(() => {
        expect(freeze.getTime()).to.equal(freeze.getTime());
      }, 10);
    });

    it('with FakeDate', () => {
      const traveled = ck.travel(1982, 5, 25, 10, 10, 10, 10);
      const freeze = ck.freeze(new Date());

      return postpone(() => {
        const tt = traveled.getTime();
        expect(freeze.getTime())
          .to.be.above(tt - 1)
          .and.below(tt + 1000);
      }, 10);
    });

    it('freeze to invalid date throws and resets', () => {
      expect(() => {
        ck.freeze(NaN);
      }).to.throw(TypeError);

      expect(Date === NativeDate).to.be.true;
      expect(Date.now()).to.be.a('number');
    });
  });

  describe('#defrost', () => {
    afterEach(ck.reset);

    it('starts ticking but is still in timekeeping mode', () => {
      const freeze = ck.freeze(1980, 1, 1);

      ck.defrost();

      return postpone(() => {
        expect(new Date().getTime()).to.be.above(freeze.getTime());
        expect(ck.isKeepingTime()).to.be.true;
      }, 10);
    });

    it('starts ticking traveled time', () => {
      ck.freeze(1982, 5, 25);
      const traveled = ck.travel(1982, 5, 25, 10, 10, 10, 10).getTime();

      ck.defrost();

      return postpone(() => {
        expect(new Date().getTime()).to.be.above(traveled - 1);
        expect(new Date().getTime()).to.be.below(traveled + 1000);
      }, 10);
    });
  });

  describe('#travel', () => {
    let now;
    beforeEach(() => {
      now = new Date();
    });
    afterEach(ck.reset);

    it('travels forwards', () => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() + 2;
      dateObj.setUTCFullYear(year);

      ck.travel(dateObj);

      expect(new Date().getUTCFullYear()).to.be.above(now.getUTCFullYear());
    });

    it('and backwards', () => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() - 2;
      dateObj.setUTCFullYear(year);

      ck.travel(dateObj);

      expect(new Date().getUTCFullYear()).to.be.below(now.getUTCFullYear());
    });

    it('with arguments', () => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() - 2;
      dateObj.setUTCFullYear(year);

      ck.travel('1970-01-01T01:01:01Z');

      expect(new Date().getUTCFullYear()).to.be.equal(1970);

      ck.travel(1980, 11, 24);

      expect(new Date().getUTCFullYear()).to.be.equal(1980);
    });

    it('without arguments does just about nothing', () => {
      ck.travel();

      expect(new Date().getUTCFullYear()).to.be.equal(now.getUTCFullYear());
    });

    it('Date.now has traveled', () => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() - 3;
      dateObj.setUTCFullYear(year);

      ck.travel(dateObj);

      return postpone(() => {
        expect(Date.now()).to.be.above(dateObj.getTime());
      }, 10);
    });

    it('frozen time refreezes time', () => {
      ck.freeze(1981, 5, 19);
      const traveledTo = ck.travel(1982, 5, 25, 10, 10, 10, 10);

      return postpone(() => {
        expect(new Date().getTime()).to.equal(traveledTo.getTime());
      }, 10);
    });

    it('with FakeDate', () => {
      const freeze = ck.freeze(1980, 0, 1);
      const traveled = ck.travel(new Date());

      return postpone(() => {
        expect(traveled.getTime()).to.equal(freeze.getTime());
      }, 10);
    });

    it('travel to invalid date throws and resets', () => {
      expect(() => {
        ck.travel(NaN);
      }).to.throw(TypeError);

      expect(Date === NativeDate).to.be.true;
      expect(Date.now()).to.be.a('number');
    });
  });

  describe('#isKeepingTime', () => {
    afterEach(ck.reset);

    it('returns true when frozen', () => {
      ck.freeze();
      expect(ck.isKeepingTime()).to.be.true;
    });

    it('returns true when traveled', () => {
      ck.travel('1972-1-1');
      expect(ck.isKeepingTime()).to.be.true;
    });

    it('but false when reset', () => {
      expect(ck.isKeepingTime()).to.be.false;
    });
  });

  describe('#reset', () => {
    afterEach(ck.reset);

    it('resets Date to native Date', () => {
      expect(Date).to.equal(NativeDate);
      ck.freeze();
      expect(Date).to.not.equal(NativeDate);

      ck.reset();

      expect(Date).to.equal(NativeDate);

      expect(Date.constructor).to.equal(NativeDate.constructor);
      expect(Date.constructor.prototype).to.equal(NativeDate.constructor.prototype);

      expect(new Date()).to.be.instanceOf(NativeDate).and.not.be.a('function');
    });

    it('after reset in combination with lodash cloneDeep returns native Date', () => {
      const content = _.assign(
        _.cloneDeep({
          d: new Date(),
        }),
      );
      expect(content.d).to.not.be.a('function');
      expect(content.d).to.be.instanceOf(NativeDate);
    });

    it('resets frozen time', () => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() + 2;
      dateObj.setUTCFullYear(year);

      const freeze = ck.freeze(dateObj);
      ck.reset();
      expect(new Date().getUTCFullYear()).to.be.below(freeze.getUTCFullYear());
      expect(Date.now()).to.be.below(freeze.getTime());
    });

    it('resets traveled time', () => {
      const dateObj = new Date();
      const year = dateObj.getUTCFullYear() + 2;
      dateObj.setUTCFullYear(year);

      ck.travel(dateObj);
      ck.reset();
      expect(new Date().getUTCFullYear()).to.be.below(dateObj.getUTCFullYear());
      expect(Date.now()).to.be.below(dateObj.getTime());
    });
  });

  describe('FakeDate', () => {
    afterEach(ck.reset);

    it('is exported', () => {
      expect(ck.FakeDate).to.be.a('function');
    });

    describe('#ctor', () => {
      it('without arguments returns date', () => {
        ck.freeze();
        expect(new Date()).to.be.instanceOf(Date);
      });

      it('with milliseconds returns date', () => {
        ck.freeze();
        const fakeDate = new Date(378691200000);
        expect(fakeDate.getUTCFullYear()).to.equal(1982);
      });

      it('with string returns date', () => {
        ck.freeze();
        const fakeDate = new Date('1982-07-01');
        expect(fakeDate.getUTCFullYear()).to.equal(1982);
      });

      it('with year, month, and day returns date', () => {
        ck.freeze();

        const fakeDate = new Date(1923, 7, 1);
        expect(fakeDate.getFullYear()).to.equal(1923);
        expect(fakeDate.getMonth()).to.equal(7);
        expect(fakeDate.getDate()).to.equal(1);
      });

      it('with time parts in constructor returns expected time', () => {
        ck.freeze();

        const fakeDate = new Date(1923, 7, 1, 10, 40, 59, 2);
        expect(fakeDate.getHours()).to.equal(10);
        expect(fakeDate.getMinutes()).to.equal(40);
        expect(fakeDate.getSeconds()).to.equal(59);
        expect(fakeDate.getMilliseconds()).to.equal(2);
      });
    });

    describe('parse', () => {
      it('returns milliseconds', () => {
        ck.freeze();
        expect(Date.parse('1/1/1970')).to.be.a('number');
      });

      it('or NaN if invalid date', () => {
        ck.freeze();

        const result = Date.parse('13/13/1970');

        expect(isNaN(result)).to.be.true;
      });
    });

    describe('UTC', () => {
      it('UTC returns milliseconds', () => {
        ck.freeze();
        expect(Date.UTC(1923, 7, 1, 10, 40, 59, 1)).to.be.below(0);
        expect(Date.UTC(1923, 7, 1, 10, 40, 59)).to.be.below(0);
        expect(Date.UTC(1923, 7, 1, 10, 40)).to.be.below(0);
        expect(Date.UTC(1923, 7, 1, 10)).to.be.below(0);
        expect(Date.UTC(1923, 7, 1)).to.be.below(0);
        expect(Date.UTC(1923, 7)).to.be.below(0);
      });

      it('UTC combined with FakeDate return defined utc date', () => {
        ck.freeze();

        const utcDate = new Date(Date.UTC(1982, 0, 1));
        expect(utcDate.getUTCFullYear()).to.equal(1982);
      });
    });

    describe('prototype', () => {
      it('expected instance functions exists', () => {
        ck.freeze();

        const fakeDate = new Date();

        expect(fakeDate.getDate, 'getDate').to.be.a('function');
        expect(fakeDate.getDay, 'getDay').to.be.a('function');
        expect(fakeDate.getFullYear, 'getFullYear').to.be.a('function');
        expect(fakeDate.getHours, 'getHours').to.be.a('function');
        expect(fakeDate.getMilliseconds, 'getMilliseconds').to.be.a('function');
        expect(fakeDate.getMinutes, 'getMinutes').to.be.a('function');
        expect(fakeDate.getMonth, 'getMonth').to.be.a('function');
        expect(fakeDate.getSeconds, 'getSeconds').to.be.a('function');
        expect(fakeDate.getTime, 'getTime').to.be.a('function');
        expect(fakeDate.getTimezoneOffset, 'getTimezoneOffset').to.be.a('function');
        expect(fakeDate.getUTCDate, 'getUTCDate').to.be.a('function');
        expect(fakeDate.getUTCDay, 'getUTCDay').to.be.a('function');
        expect(fakeDate.getUTCFullYear, 'getUTCFullYear').to.be.a('function');
        expect(fakeDate.getUTCHours, 'getUTCHours').to.be.a('function');
        expect(fakeDate.getUTCMilliseconds, 'getUTCMilliseconds').to.be.a('function');
        expect(fakeDate.getUTCMinutes, 'getUTCMinutes').to.be.a('function');
        expect(fakeDate.getUTCMonth, 'getUTCMonth').to.be.a('function');
        expect(fakeDate.getUTCSeconds, 'getUTCSeconds').to.be.a('function');
        expect(fakeDate.getYear, 'getYear').to.be.a('function');
        expect(fakeDate.setDate, 'setDate').to.be.a('function');
        expect(fakeDate.setFullYear, 'setFullYear').to.be.a('function');
        expect(fakeDate.setHours, 'setHours').to.be.a('function');
        expect(fakeDate.setMilliseconds, 'setMilliseconds').to.be.a('function');
        expect(fakeDate.setMinutes, 'setMinutes').to.be.a('function');
        expect(fakeDate.setMonth, 'setMonth').to.be.a('function');
        expect(fakeDate.setSeconds, 'setSeconds').to.be.a('function');
        expect(fakeDate.setTime, 'setTime').to.be.a('function');
        expect(fakeDate.setUTCDate, 'setUTCDate').to.be.a('function');
        expect(fakeDate.setUTCFullYear, 'setUTCFullYear').to.be.a('function');
        expect(fakeDate.setUTCHours, 'setUTCHours').to.be.a('function');
        expect(fakeDate.setUTCMilliseconds, 'setUTCMilliseconds').to.be.a('function');
        expect(fakeDate.setUTCMinutes, 'setUTCMinutes').to.be.a('function');
        expect(fakeDate.setUTCMonth, 'setUTCMonth').to.be.a('function');
        expect(fakeDate.setUTCSeconds, 'setUTCSeconds').to.be.a('function');
        expect(fakeDate.setYear, 'setYear').to.be.a('function');
        expect(fakeDate.toDateString, 'toDateString').to.be.a('function');
        expect(fakeDate.toGMTString, 'toGMTString').to.be.a('function');
        expect(fakeDate.toISOString, 'toISOString').to.be.a('function');
        expect(fakeDate.toJSON, 'toJSON').to.be.a('function');
        expect(fakeDate.toLocaleDateString, 'toLocaleDateString').to.be.a('function');
        expect(fakeDate.toLocaleString, 'toLocaleString').to.be.a('function');
        expect(fakeDate.toLocaleTimeString, 'toLocaleTimeString').to.be.a('function');
        expect(fakeDate.toString, 'toString').to.be.a('function');
        expect(fakeDate.toTimeString, 'toTimeString').to.be.a('function');
        expect(fakeDate.toUTCString, 'toUTCString').to.be.a('function');
        expect(fakeDate.valueOf, 'valueOf').to.be.a('function');
      });
    });
  });

  describe('Other time dependant functionality', () => {
    let isReset = false;
    beforeEach(() => {
      isReset = false;
    });

    afterEach(() => {
      ck.reset();
      isReset = true;
    });

    describe('setTimeout', () => {
      it('has expected behavior', () => {
        ck.freeze();

        return new Promise((resolve) => {
          setTimeout(() => {
            expect(isReset).to.be.false;
            resolve();
          }, 10);
        });
      });
    });

    describe('setImmediate', () => {
      it('has expected behavior', () => {
        ck.freeze();

        return new Promise((resolve) => {
          setImmediate(() => {
            expect(isReset).to.be.false;
            resolve();
          });
        });
      });
    });

    describe('setInterval', () => {
      it('has expected behavior', () => {
        ck.freeze();

        let count = 2;

        return new Promise((resolve) => {
          const ptr = setInterval(atInterval, 10);
          function atInterval() {
            if (count === 0) {
              clearInterval(ptr);
              resolve();
            }

            expect(isReset).to.be.false;

            count--;
          }
        });
      });
    });
  });

  describe('luxon', () => {
    afterEach(ck.reset);

    it('frozen format has expected behavior', () => {
      ck.freeze(1980, 0, 1);
      return postpone(() => {
        expect(DateTime.now().toISODate()).to.equal('1980-01-01');
      }, 10);
    });

    it('traveled format has expected behavior', () => {
      ck.travel(1981, 0, 1);
      return postpone(() => {
        expect(DateTime.now().toISODate()).to.equal('1981-01-01');
      }, 10);
    });

    it('travels when used as argument', () => {
      const luxonDate = DateTime.now().plus({ day: 7 });

      ck.travel(luxonDate);

      expect(new Date().getTime()).to.be.equal(luxonDate.toMillis());
    });

    it('freezes when used as argument', () => {
      const luxonDate = DateTime.now().minus({ day: 1 });

      ck.freeze(luxonDate);

      return postpone(() => {
        expect(new Date().getTime()).to.equal(luxonDate.toMillis());
      }, 10);
    });
  });

  describe('moment', () => {
    afterEach(ck.reset);

    it('frozen format has expected behavior', () => {
      ck.freeze(1980, 0, 1);
      return postpone(() => {
        expect(moment().format('YYYY-MM-DD')).to.equal('1980-01-01');
      }, 10);
    });

    it('traveled format has expected behavior', () => {
      ck.travel(1981, 0, 1);
      return postpone(() => {
        expect(moment().format('YYYY-MM-DD')).to.equal('1981-01-01');
      }, 10);
    });

    it('travels when used as argument', () => {
      const momentDate = moment().add(7, 'days');

      ck.travel(momentDate);

      expect(new Date().getTime()).to.be.equal(momentDate.valueOf());
    });

    it('freezes when used as argument', () => {
      const momentDate = moment().subtract(1, 'day');

      ck.freeze(momentDate);

      return postpone(() => {
        expect(new Date().getTime()).to.equal(momentDate.valueOf());
      }, 10);
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
