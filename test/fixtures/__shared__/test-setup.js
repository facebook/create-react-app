const path = require('path');
const TestSetup = require('./util/setup');
const { timeout } = require('../../__shared__/utils');

const fixturePath = path.dirname(module.parent.filename);
const fixtureName = path.basename(fixturePath);
const testSetup = new TestSetup(fixtureName, fixturePath);

beforeAll(async () => {
  await testSetup.setup();
}, timeout);
afterAll(async () => {
  await testSetup.teardown();
});

beforeEach(() => jest.setTimeout(timeout));

module.exports = testSetup;
