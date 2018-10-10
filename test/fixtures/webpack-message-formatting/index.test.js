const testSetup = require('../__shared__/test-setup');

const fs = require('fs-extra');
const path = require('path');

test('formats babel syntax error', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppBabel.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('formats css syntax error', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppCss.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('formats unknown export', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppUnknownExport.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('formats aliased unknown export', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppAliasUnknownExport.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('formats no default export', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppNoDefault.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('formats missing package', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppMissingPackage.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('formats eslint warning', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppLintWarning.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  let { stdout, stderr } = await testSetup.scripts.build();
  const sizeIndex = stdout.indexOf('File sizes after gzip');
  if (sizeIndex !== -1) {
    stdout = stdout.substring(0, sizeIndex);
  }
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('formats eslint error', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppLintError.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('helps when users tries to use sass', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppSass.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('formats file not found error', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppUnknownFile.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});

test('formats case sensitive path error', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppIncorrectCase.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.start({ smoke: true });
  if (process.platform === 'darwin') {
    expect(stderr).toMatch(
      `Cannot find file: 'export5.js' does not match the corresponding name on disk: './src/Export5.js'.`
    );
  } else {
    expect(stderr).not.toEqual(''); // TODO: figure out how we can test this on Linux/Windows
    // I believe getting this working requires we tap into enhanced-resolve
    // pipeline, which is debt we don't want to take on right now.
  }
});

test('formats out of scope error', async () => {
  fs.copySync(
    path.join(__dirname, 'src', 'AppOutOfScopeImport.js'),
    path.join(testSetup.testDirectory, 'src', 'App.js')
  );

  const { stdout, stderr } = await testSetup.scripts.build();
  expect({ stdout, stderr }).toMatchSnapshot();
});
