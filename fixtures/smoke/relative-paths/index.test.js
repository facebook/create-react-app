const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const {
  bootstrap,
  isSuccessfulDevelopment,
  isSuccessfulProduction,
} = require('../../utils');
beforeEach(async () => {
  await bootstrap({ directory: global.testDirectory, template: __dirname });
});

describe('relative paths', () => {
  // TODO: enable when development relative paths are supported
  xit('builds in development', async () => {
    await isSuccessfulDevelopment({ directory: global.testDirectory });
  });
  it('builds in production', async () => {
    await isSuccessfulProduction({ directory: global.testDirectory });

    const buildDir = path.join(global.testDirectory, 'build');
    const cssFile = path.join(
      buildDir,
      globby.sync('**/*.css', { cwd: buildDir }).pop()
    );
    const svgFile = path.join(
      buildDir,
      globby.sync('**/*.svg', { cwd: buildDir }).pop()
    );
    const desiredPath = /url\((.+?)\)/
      .exec(fs.readFileSync(cssFile, 'utf8'))
      .pop();
    expect(path.resolve(path.join(path.dirname(cssFile), desiredPath))).toBe(
      path.resolve(svgFile)
    );
  });
});
