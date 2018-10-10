const testSetup = require('../__shared__/test-setup');

if (testSetup.isLocal) {
  // TODO: make this work locally
  test('skipped locally', () => {});
} else {
  test('builds in development', async () => {
    const { fulfilled } = await testSetup.scripts.start({ smoke: true });
    expect(fulfilled).toBe(true);
  });

  test('builds in production', async () => {
    const { fulfilled } = await testSetup.scripts.build();
    expect(fulfilled).toBe(true);
  });
}
