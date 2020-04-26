const testSetup = require('../__shared__/test-setup');

const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');

test('builds with custom postcss config', async () => {
  await testSetup.scripts.build();

  const buildDir = path.join(testSetup.testDirectory, 'build');
  const cssFile = path.join(
    buildDir,
    globby.sync('**/*.css', { cwd: buildDir }).pop()
  );

  expect(fs.readFileSync(cssFile, 'utf8')).toMatchSnapshot();
});
