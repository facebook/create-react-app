const testSetup = require('../__shared__/test-setup');

test('passes tests', async () => {
  const { fulfilled, ...rest } = await testSetup.scripts.test({
    jestEnvironment: 'node',
  });
  console.log(rest);
  expect(fulfilled).toBe(true);
});
