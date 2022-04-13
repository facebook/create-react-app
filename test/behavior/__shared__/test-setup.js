'use strict';

const path = require('path');
const TestSetup = require('./util/setup');

const { path: testDir } = module.parent;
const fixtureName = path.basename(testDir);
const fixturePath = path.resolve(testDir, '..', '__fixtures__', fixtureName);
const testSetup = new TestSetup(fixtureName, fixturePath);

beforeAll(async () => {
  await testSetup.setup();
});

afterAll(async () => {
  await testSetup.teardown();
});

module.exports = testSetup;
