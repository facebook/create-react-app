'use strict';

const path = require('path');
const TestSetup = require('./util/setup');

const fixturePath = path.dirname(module.parent.filename);
const fixtureName = path.basename(fixturePath);
const testSetup = new TestSetup(fixtureName, fixturePath);

beforeAll(async () => {
  await testSetup.setup();
});

afterAll(async () => {
  await testSetup.teardown();
});

module.exports = testSetup;
