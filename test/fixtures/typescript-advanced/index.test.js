const testSetup = require('../__shared__/test-setup');

test('builds in development', async () => {
  const { fulfilled } = await testSetup.scripts.start({ smoke: true });
  expect(fulfilled).toBe(true);
});
test('builds in production', async () => {
  const { fulfilled } = await testSetup.scripts.build();
  expect(fulfilled).toBe(true);
});
test('passes tests', async () => {
  const { fulfilled } = await testSetup.scripts.test({
    jestEnvironment: 'node',
  });
  expect(fulfilled).toBe(true);
});
