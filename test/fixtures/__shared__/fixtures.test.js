const fs = require('fs-extra');
const path = require('path');

const TestSetup = require('./util/setup');

const directoryFixtures = path.resolve(__dirname, '..');

const fixturePaths = fs
  .readdirSync(directoryFixtures)
  .filter(
    directory =>
      !directory.startsWith('__') &&
      fs.lstatSync(path.resolve(directoryFixtures, directory)).isDirectory
  )
  .map(directory => path.resolve(directoryFixtures, directory));

for (const fixturePath of fixturePaths) {
  const fixtureName = path.basename(fixturePath);
  const disablePnp = fs.existsSync(path.resolve(fixturePath, '.disable-pnp'));
  describe(fixtureName, () => {
    const testSetup = new TestSetup(fixtureName, fixturePath, {
      pnp: !disablePnp,
    });
    beforeAll(async () => {
      await testSetup.setup();
    }, 1000 * 30);
    afterAll(async () => {
      await testSetup.teardown();
    });
    beforeEach(() => jest.setTimeout(1000 * 60 * 5));
    require(path.resolve(fixturePath, 'test.partial.js'))(testSetup);
  });
}
