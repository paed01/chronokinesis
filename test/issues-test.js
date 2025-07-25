import * as ck from 'chronokinesis';

describe('issues', () => {
  describe('issue #4 - multiple module load', () => {
    let freshCk;
    afterEach(ck.reset);
    afterEach(() => freshCk?.reset());

    it('module loaded multiple times while in fake mode uses Native date', async () => {
      ck.freeze('2025-07-23');

      freshCk = await import('../index.js?version=1');

      expect(new Date().toISOString()).to.equal('2025-07-23T00:00:00.000Z');

      expect(ck).to.not.equal(freshCk);

      freshCk.freeze('2025-07-17');

      expect(new Date().toISOString()).to.equal('2025-07-17T00:00:00.000Z');
    });

    it('freshly loaded module is not keeping time since fake date is another function', async () => {
      ck.freeze('2025-07-23');

      freshCk = await import('../index.js?version=2');

      expect(ck.isKeepingTime(), 'default module keeping time').to.be.ok;

      expect(freshCk.isKeepingTime(), 'fresh module keeping time').to.be.false;
    });
  });
});
