const testSetup = require('../__shared__/test-setup');

test('extending eslint typescript in development', async () => {
  const { fulfilled } = await testSetup.scripts.start({ smoke: true });
  expect(fulfilled).toBe(false);
});
test('extending eslint typescript in production', async () => {
  const { fulfilled } = await testSetup.scripts.build();
  expect(fulfilled).toBe(false);
});
