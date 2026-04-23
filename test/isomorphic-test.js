import fs from 'node:fs';
import path from 'node:path';
import { Window } from 'happy-dom';

describe('isomorphic UMD in happy-dom', () => {
  let window;
  let ck;
  let WindowDate;
  let WindowPerformanceNow;

  before(() => {
    window = new Window();
    WindowDate = window.Date;
    WindowPerformanceNow = window.performance.now;

    const umd = fs.readFileSync(path.resolve('dist/chronokinesis.cjs'), 'utf-8');
    window.eval(umd);
    ck = window.chronokinesis;
  });

  after(async () => {
    if (ck) ck.reset();
    await window.happyDOM.close();
  });

  afterEach(() => ck && ck.reset());

  it('has no Node process inside the window vm context', () => {
    expect(window.eval('typeof process')).to.equal('undefined');
  });

  it('attaches chronokinesis to the window global', () => {
    expect(ck).to.be.an('object');
    expect(ck).to.have.property('freeze').that.is.a('function');
    expect(ck).to.have.property('travel').that.is.a('function');
    expect(ck).to.have.property('reset').that.is.a('function');
    expect(ck).to.have.property('isKeepingTime').that.is.a('function');
  });

  it('freeze() mocks window.Date even with no process available', () => {
    ck.freeze(1980, 0, 1);
    expect(ck.isKeepingTime()).to.be.true;
    expect(new window.Date().getFullYear()).to.equal(1980);
  });

  it('travel() works in the window and reset() restores window.Date', () => {
    ck.travel(1981, 0, 1);
    expect(new window.Date().getFullYear()).to.equal(1981);

    ck.reset();
    expect(ck.isKeepingTime()).to.be.false;
    expect(new window.Date().getFullYear()).to.be.above(2020);
    expect(window.Date).to.equal(WindowDate);
  });

  it('performance.now is swapped while frozen and restored on reset', () => {
    ck.freeze(1980, 0, 1);
    const first = window.performance.now();
    const second = window.performance.now();
    expect(second).to.equal(first);

    ck.reset();
    expect(window.performance.now).to.equal(WindowPerformanceNow);
  });

  it('performance.now tracks travelled time in ms', () => {
    const target = ck.travel(2050, 0, 1).getTime();
    const now = window.performance.now();
    const expected = target - window.performance.timeOrigin;
    expect(now - expected)
      .to.be.at.least(0)
      .and.below(1000);
  });

  it('does not attempt to mock process.hrtime when process is absent', () => {
    expect(() => {
      ck.freeze(1980, 0, 1);
      ck.reset();
    }).to.not.throw();
    // window context has no `process` binding so nothing to assert beyond "no throw"
    expect(window.eval('typeof process')).to.equal('undefined');
  });
});
