'use strict';

const execa = require('execa');
const { mkdirp, writeFileSync, existsSync, readdirSync } = require('fs-extra');
const { join } = require('path');
const { rmSync } = require('fs');

const cli = require.resolve('create-react-app/index.js');

// Increase the timeout for GitHub macOS runner
jest.setTimeout(1000 * 60 * (process.env.RUNNER_OS === 'macOS' ? 10 : 5));

const projectName = 'test-app';
const genPath = join(__dirname, projectName);

const generatedFiles = [
  '.gitignore',
  'README.md',
  'node_modules',
  'package.json',
  'public',
  'src',
  'package-lock.json',
];

const removeGenPath = () => {
  rmSync(genPath, {
    recursive: true,
    force: true,
  });
};

beforeEach(removeGenPath);
afterAll(async () => {
  removeGenPath();
  // Defer jest result output waiting for stdout to flush
  await new Promise(resolve => setTimeout(resolve, 100));
});

const run = async (args, options) => {
  process.stdout.write(
    `::group::Test "${
      expect.getState().currentTestName
    }" - "create-react-app ${args.join(' ')}" output:\n`
  );
  const result = execa('node', [cli].concat(args), options);
  result.stdout.on('data', chunk =>
    process.stdout.write(chunk.toString('utf8'))
  );
  const childProcessResult = await result;
  process.stdout.write(`ExitCode: ${childProcessResult.exitCode}\n`);
  process.stdout.write('::endgroup::\n');
  const files = existsSync(genPath)
    ? readdirSync(genPath).filter(f => existsSync(join(genPath, f)))
    : null;
  return {
    ...childProcessResult,
    files,
  };
};

const expectAllFiles = (arr1, arr2) =>
  expect([...arr1].sort()).toEqual([...arr2].sort());

describe('create-react-app', () => {
  it('check yarn installation', async () => {
    const { exitCode } = await execa('yarn', ['--version']);

    // Assert for exit code
    expect(exitCode).toBe(0);
  });

  it('asks to supply an argument if none supplied', async () => {
    const { exitCode, stderr, files } = await run([], { reject: false });

    // Assertions
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Please specify the project directory');
    expect(files).toBe(null);
  });

  it('creates a project on supplying a name as the argument', async () => {
    const { exitCode, files } = await run([projectName], { cwd: __dirname });

    // Assert for exit code
    expect(exitCode).toBe(0);

    // Assert for the generated files
    expectAllFiles(files, generatedFiles);
  });

  it('warns about conflicting files in path', async () => {
    // Create the temporary directory
    await mkdirp(genPath);

    // Create a package.json file
    const pkgJson = join(genPath, 'package.json');
    writeFileSync(pkgJson, '{ "foo": "bar" }');

    const { exitCode, stdout, files } = await run([projectName], {
      cwd: __dirname,
      reject: false,
    });

    // Assert for exit code
    expect(exitCode).toBe(1);

    // Assert for the expected message
    expect(stdout).toContain(
      `The directory ${projectName} contains files that could conflict`
    );

    // Existing file is still there
    expectAllFiles(files, ['package.json']);
  });

  it('creates a project in the current directory', async () => {
    // Create temporary directory
    await mkdirp(genPath);

    // Create a project in the current directory
    const { exitCode, files } = await run(['.'], { cwd: genPath });

    // Assert for exit code
    expect(exitCode).toBe(0);

    // Assert for the generated files
    expectAllFiles(files, generatedFiles);
  });

  it('uses yarn as the package manager', async () => {
    const { exitCode, files } = await run([projectName], {
      cwd: __dirname,
      env: { npm_config_user_agent: 'yarn' },
    });

    // Assert for exit code
    expect(exitCode).toBe(0);

    // Assert for the generated files
    const generatedFilesWithYarn = generatedFiles.map(file =>
      file === 'package-lock.json' ? 'yarn.lock' : file
    );

    expectAllFiles(files, generatedFilesWithYarn);
  });

  it('creates a project based on the typescript template', async () => {
    const { exitCode, files } = await run(
      [projectName, '--template', 'typescript'],
      {
        cwd: __dirname,
      }
    );

    // Assert for exit code
    expect(exitCode).toBe(0);

    // Assert for the generated files
    expectAllFiles(files, [...generatedFiles, 'tsconfig.json']);
  });
});
