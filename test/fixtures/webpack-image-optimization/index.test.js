const testSetup = require('../__shared__/test-setup');

const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');

test('optimizes in production', async () => {
  const { fulfilled } = await testSetup.scripts.build();
  expect(fulfilled).toBe(true);

  const buildDir = path.join(testSetup.testDirectory, 'build');
  const builtImageFile = path.join(
    buildDir,
    globby.sync('**/*.png', { cwd: buildDir }).pop()
  );
  const recievedBuf = fs.readFileSync(builtImageFile);

  const expectedImageFile = path.join(
    testSetup.templateDirectory,
    './src/images/webpack-optimized.png'
  );
  const expectedBuf = fs.readFileSync(expectedImageFile);

  expect(recievedBuf).toStrictEqual(expectedBuf);
});
