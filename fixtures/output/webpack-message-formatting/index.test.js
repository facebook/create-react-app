const {
  bootstrap,
  getOutputDevelopment,
  getOutputProduction,
} = require('../../utils');
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

  it('formats babel syntax error', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppBabel.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  it('formats css syntax error', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppCss.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  it('formats unknown export', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppUnknownExport.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  it('formats aliased unknown export', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppAliasUnknownExport.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  it('formats no default export', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppNoDefault.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  it('formats missing package', async () => {
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

  it('helps when users tries to use sass', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppSass.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  it('formats file not found error', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppUnknownFile.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });

  it('formats case sensitive path error', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppIncorrectCase.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputDevelopment({ directory: testDirectory });
    if (process.platform === 'darwin') {
      expect(response.stderr).toMatch(
        `Cannot find file: 'export5.js' does not match the corresponding name on disk: './src/Export5.js'.`
      );
    } else {
      expect(response.stderr).not.toEqual(''); // TODO: figure out how we can test this on Linux/Windows
      // I believe getting this working requires we tap into enhanced-resolve
      // pipeline, which is debt we don't want to take on right now.
    }
  });

  it('formats out of scope error', async () => {
    fs.copySync(
      path.join(__dirname, 'src', 'AppOutOfScopeImport.js'),
      path.join(testDirectory, 'src', 'App.js')
    );

    const response = await getOutputProduction({ directory: testDirectory });
    expect(response).toMatchSnapshot();
  });
});
