const { bootstrap, getOutputProduction } = require('../../utils');
const fs = require('fs-extra');
const path = require('path');
const Semaphore = require('async-sema');
const tempy = require('tempy');

describe('webpack message formatting', () => {
  const semaphore = new Semaphore(1, { capacity: Infinity });
  let testDirectory;
  beforeAll(async () => {
    testDirectory = tempy.directory();
    await bootstrap({ directory: testDirectory, template: __dirname });
  });
  beforeEach(async () => {
    await semaphore.acquire();
  });
  afterEach(async () => {
    fs.removeSync(path.join(testDirectory, 'src', 'App.js'));
    semaphore.release();
  });

  xit('formats babel syntax error', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppBabel.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  xit('formats css syntax error', async () => {
    // TODO: fix me!
    fs.copySync(
      path.join(__dirname, 'src', 'AppCss.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  xit('formats unknown export', async () => {
    // TODO: fix me!
    fs.copySync(
      path.join(__dirname, 'src', 'AppUnknownExport.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  xit('formats missing package', async () => {
    // TODO: fix me!
    fs.copySync(
      path.join(__dirname, 'src', 'AppMissingPackage.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  it('formats eslint warning', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppLintWarning.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    const sizeIndex = response.stdout.indexOf('File sizes after gzip');
    if (sizeIndex !== -1) {
      response.stdout = response.stdout.substring(0, sizeIndex);
    }
    expect(response).toMatchSnapshot();
  });

  it('formats eslint error', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppLintError.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });
});
