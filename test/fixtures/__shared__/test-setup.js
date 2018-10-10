const path = require('path');
const fs = require('fs-extra');
const TestSetup = require('./util/setup');

const fixturePath = path.dirname(module.parent.filename);
const fixtureName = path.basename(fixturePath);
const disablePnp = fs.existsSync(path.resolve(fixturePath, '.disable-pnp'));
global.testSetup = new TestSetup(fixtureName, fixturePath, {
  pnp: !disablePnp,
});

beforeAll(async () => {
  await global.testSetup.setup();
}, 1000 * 60 * 5);
afterAll(async () => {
  await global.testSetup.teardown();
});

beforeEach(() => jest.setTimeout(1000 * 60 * 5));
