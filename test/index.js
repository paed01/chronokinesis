'use strict';

const expect = require('code').expect;
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const ck = require('..');

lab.experiment('chronokinesis', () => {
  lab.experiment('#freeze', () => {
    lab.afterEach((done) => {
      ck.reset();
      done();
    });

    lab.test('stops time', (done) => {
      let now = new Date();
      ck.freeze(now);
      setTimeout(() => {
        expect((new Date()).getTime()).to.equal(now.getTime());
        done();
      }, 10);
    });

    lab.test('can be used again', (done) => {
      let now = new Date();
      ck.freeze(now);

      let again = new Date('2015-12-12');

      ck.freeze(again);

      setTimeout(() => {
        expect((new Date()).getTime()).to.equal(again.getTime());
        done();
      }, 10);
    });

    lab.test('is not affected when a date is manipulated', (done) => {
      let now = new Date();
      ck.freeze(now);

      setTimeout(() => {
        let dateObj = new Date();
        let hour = dateObj.getUTCHours() + 1;
        dateObj.setUTCHours(hour);

        expect(dateObj.getUTCHours()).to.equal(hour);
        expect((new Date()).getTime()).to.equal(now.getTime());

        done();
      }, 10);
    });
  });

  lab.experiment('#travel', () => {



  });
});
