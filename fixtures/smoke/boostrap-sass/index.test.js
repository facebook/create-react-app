const {
  bootstrap,
  isSuccessfulDevelopment,
  isSuccessfulProduction,
} = require('../../utils');
beforeEach(async () => {
  await bootstrap({ directory: global.testDirectory, template: __dirname });
});

describe('bootstrap sass', () => {
  it('builds in development', async () => {
    await isSuccessfulDevelopment({ directory: global.testDirectory });
  });
  it('builds in production', async () => {
    await isSuccessfulProduction({ directory: global.testDirectory });
  });
});
