const fs = require('fs-extra');
const tempy = require('tempy');

beforeEach(() => {
  global.testDirectory = tempy.directory();
  jest.setTimeout(1000 * 60 * 5);
});
afterEach(() => {
  fs.removeSync(global.testDirectory);
});
