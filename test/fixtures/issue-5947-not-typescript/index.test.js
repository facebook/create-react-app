const testSetup = require('../__shared__/test-setup');
const path = require('path');
const fs = require('fs');

test('Ignores node_modules when detecting TypeScript', async () => {
  // CRA build will check for TypeScript files by
  // globbing for src/**/*.ts however this shouldn't
  // include any node_modules directories within src.
  // See https://github.com/facebook/create-react-app/issues/5947

  const tsConfigPath = path.join(testSetup.testDirectory, 'tsconfig.json');
  const tsPackagePath = [
    testSetup.testDirectory,
    'src',
    'node_modules',
    'package',
    'index.ts',
  ];
  const dtsSrcPath = [testSetup.testDirectory, 'src', 'types', 'index.d.ts'];
  const tsSrcPath = path.join(testSetup.testDirectory, 'src', 'index.ts');

  // Step 1.
  // See if src/node_modules/package/index.ts is treated
  // as a JS project
  fs.mkdirSync(path.join(...tsPackagePath.slice(0, 2)));
  fs.mkdirSync(path.join(...tsPackagePath.slice(0, 3)));
  fs.mkdirSync(path.join(...tsPackagePath.slice(0, 4)));
  fs.writeFileSync(path.join(...tsPackagePath));
  await testSetup.scripts.build();
  expect(fs.existsSync(tsConfigPath)).toBe(false);

  // Step 1b.
  // See if src/types/index.d.ts is treated as a JS project
  fs.mkdirSync(path.join(...dtsSrcPath.slice(0, 3)));
  fs.writeFileSync(path.join(...dtsSrcPath));
  await testSetup.scripts.build();
  expect(fs.existsSync(tsConfigPath)).toBe(false);

  // Step 2.
  // Add TS and ensure tsconfig.json is generated
  fs.writeFileSync(tsSrcPath);
  await testSetup.scripts.build();
  expect(fs.existsSync(tsConfigPath)).toBe(true);
});
