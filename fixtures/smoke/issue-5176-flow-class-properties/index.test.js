const { bootstrap, isSuccessfulTest } = require('../../utils');
beforeEach(async () => {
  await bootstrap({ directory: global.testDirectory, template: __dirname });
});

describe('issue #5176 (flow class properties interaction)', () => {
  it('passes tests', async () => {
    await isSuccessfulTest({
      directory: global.testDirectory,
      jestEnvironment: 'node',
    });
  });
});
