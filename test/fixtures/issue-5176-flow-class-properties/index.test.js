const testSetup = require('../__shared__/test-setup');

test('passes tests', async () => {
  const { fulfilled } = await testSetup.scripts.test({
    jestEnvironment: 'node',
  });
  expect(fulfilled).toBe(true);
});
