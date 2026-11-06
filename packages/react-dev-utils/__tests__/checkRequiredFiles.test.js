/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const checkRequiredFiles = require('../checkRequiredFiles');

describe('checkRequiredFiles', () => {
  let tmpDir;
  let logSpy;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-required-files-'));
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function createFile(name) {
    const filePath = path.join(tmpDir, name);
    fs.writeFileSync(filePath, '');
    return filePath;
  }

  it('returns true when all files exist', () => {
    const files = [createFile('index.html'), createFile('index.js')];

    expect(checkRequiredFiles(files)).toBe(true);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('returns true for an empty list', () => {
    expect(checkRequiredFiles([])).toBe(true);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('returns false when a file is missing', () => {
    const files = [createFile('index.html'), path.join(tmpDir, 'missing.js')];

    expect(checkRequiredFiles(files)).toBe(false);
  });

  it('logs the name and directory of the first missing file', () => {
    const missing = path.join(tmpDir, 'missing.js');
    const files = [
      createFile('index.html'),
      missing,
      path.join(tmpDir, 'other.js'),
    ];

    checkRequiredFiles(files);

    const output = logSpy.mock.calls.map(args => args.join(' ')).join('\n');
    expect(output).toContain('Could not find a required file.');
    expect(output).toContain('missing.js');
    expect(output).toContain(tmpDir);
    expect(output).not.toContain('other.js');
  });

  it('checks existence using fs.constants.F_OK', () => {
    const accessSpy = jest.spyOn(fs, 'accessSync');
    const file = createFile('index.js');

    checkRequiredFiles([file]);

    expect(accessSpy).toHaveBeenCalledTimes(1);
    expect(accessSpy).toHaveBeenCalledWith(file, fs.constants.F_OK);
    expect(typeof accessSpy.mock.calls[0][1]).toBe('number');
  });

  it('does not rely on the deprecated fs.F_OK alias', () => {
    // Current Node releases define `fs.F_OK` as non-configurable (or drop it
    // entirely), so it cannot be redefined on the real module. Instead, load
    // the module against an `fs` whose `F_OK` alias is unavailable.
    const accessSpy = jest.spyOn(fs, 'accessSync');
    let isolatedCheckRequiredFiles;

    jest.isolateModules(() => {
      jest.doMock('fs', () => {
        const fsWithoutAlias = Object.create(fs);
        Object.defineProperty(fsWithoutAlias, 'F_OK', {
          configurable: true,
          get() {
            return undefined;
          },
        });
        return fsWithoutAlias;
      });
      isolatedCheckRequiredFiles = require('../checkRequiredFiles');
    });

    try {
      const file = createFile('index.js');
      expect(isolatedCheckRequiredFiles([file])).toBe(true);
      expect(accessSpy).toHaveBeenCalledTimes(1);
      expect(accessSpy.mock.calls[0][1]).toBe(fs.constants.F_OK);
      expect(accessSpy.mock.calls[0][1]).not.toBeUndefined();
    } finally {
      jest.dontMock('fs');
    }
  });
});
