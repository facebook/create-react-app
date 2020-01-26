const testSetup = require('../__shared__/test-setup');

test('builds in development', async () => {
  const { fulfilled, stderr } = await testSetup.scripts.start({ smoke: true });
  expect(stderr).toBe("We detected TypeScript in your project (src/App.test.ts) and created a tsconfig.json file for you.\n");
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
