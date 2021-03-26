const path = require('path');
const fs = require('fs-extra');
const TestSetup = require('./util/setup');

const fixturePath = path.dirname(module.parent.filename);
const fixtureName = path.basename(fixturePath);
const disablePnp = fs.existsSync(path.resolve(fixturePath, '.disable-pnp'));
const testSetup = new TestSetup(fixtureName, fixturePath, {
  pnp: !disablePnp,
});

beforeAll(async () => {
  await testSetup.setup();
}, 1000 * 60 * 5);
afterAll(async () => {
  await testSetup.teardown();
});

jest.setTimeout(1000 * 60 * 15);

module.exports = testSetup;
