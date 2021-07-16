const testSetup = require('../__shared__/test-setup');

test('extended eslint error should break the development', async () => {
  const { fulfilled } = await testSetup.scripts.start({ smoke: true });
  expect(fulfilled).toBe(false);
});

test('extended eslint error should break the build in production', async () => {
  const { fulfilled } = await testSetup.scripts.build();
  expect(fulfilled).toBe(false);
});
