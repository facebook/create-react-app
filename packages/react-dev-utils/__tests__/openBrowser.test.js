/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.mock('open', () => jest.fn(() => Promise.resolve()));
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  execFileSync: jest.fn(),
}));

// Payload shape from https://github.com/react/create-react-app/issues/17269
// encodeURI leaves $, (, ) intact — those are dangerous when passed through a shell.
const INJECTION_URL = 'http://localhost/$(touch$IFS/tmp/RCE_VERIFIED)';

describe('openBrowser', () => {
  const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
  let open;
  let execSync;
  let execFileSync;
  let openBrowser;
  let browserEnv;

  function setPlatform(platform) {
    Object.defineProperty(process, 'platform', {
      configurable: true,
      enumerable: true,
      value: platform,
      writable: false,
    });
  }

  function loadOpenBrowser() {
    jest.resetModules();
    open = require('open');
    ({ execSync, execFileSync } = require('child_process'));
    open.mockReset();
    execSync.mockReset();
    execFileSync.mockReset();
    open.mockImplementation(() => Promise.resolve());
    execSync.mockImplementation(() => '');
    execFileSync.mockImplementation(() => '');
    openBrowser = require('../openBrowser');
  }

  beforeEach(() => {
    browserEnv = process.env.BROWSER;
    delete process.env.BROWSER;
    delete process.env.BROWSER_ARGS;
    setPlatform('linux');
    loadOpenBrowser();
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', originalPlatform);
    if (browserEnv === undefined) {
      delete process.env.BROWSER;
    } else {
      process.env.BROWSER = browserEnv;
    }
  });

  it('does not open a browser when BROWSER=none', () => {
    process.env.BROWSER = 'none';

    expect(openBrowser('http://localhost:3000')).toBe(false);
    expect(execFileSync).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  describe('macOS Chromium AppleScript path', () => {
    beforeEach(() => {
      setPlatform('darwin');
      loadOpenBrowser();
    });

    it('opens via execFileSync with arguments, not a shell string', () => {
      const result = openBrowser('http://localhost:3000');

      expect(result).toBe(true);
      expect(execFileSync).toHaveBeenCalledTimes(1);
      expect(execFileSync).toHaveBeenCalledWith(
        'osascript',
        ['openChrome.applescript', 'http://localhost:3000', expect.any(String)],
        expect.objectContaining({
          cwd: expect.any(String),
          stdio: 'ignore',
        })
      );

      // Vulnerable pattern: interpolating the URL into a shell command string.
      const osascriptShellCalls = execSync.mock.calls.filter(
        ([command]) =>
          typeof command === 'string' && command.includes('osascript')
      );
      expect(osascriptShellCalls).toHaveLength(0);
    });

    it('passes injection payloads as a single argv entry (no shell)', () => {
      const result = openBrowser(INJECTION_URL);

      expect(result).toBe(true);
      expect(execFileSync).toHaveBeenCalledTimes(1);

      const [file, args] = execFileSync.mock.calls[0];
      expect(file).toBe('osascript');
      expect(args).toEqual([
        'openChrome.applescript',
        encodeURI(INJECTION_URL),
        expect.any(String),
      ]);

      // Arguments are discrete — the shell never sees $(...) / $IFS.
      expect(args[1]).toContain('$(');
      expect(args[1]).toContain('$IFS');

      const joinedOsascriptCommands = execSync.mock.calls
        .map(call => call[0])
        .filter(
          command =>
            typeof command === 'string' && command.includes('osascript')
        )
        .join('\n');
      expect(joinedOsascriptCommands).not.toContain(INJECTION_URL);
      expect(joinedOsascriptCommands).not.toContain(encodeURI(INJECTION_URL));
    });

    it('falls back to open when no Chromium browser is running', () => {
      execSync.mockImplementation(() => {
        throw new Error('grep: no match');
      });

      const result = openBrowser('http://localhost:3000');

      expect(result).toBe(true);
      expect(execFileSync).not.toHaveBeenCalled();
      expect(open).toHaveBeenCalledWith(
        'http://localhost:3000',
        expect.objectContaining({ wait: false, url: true })
      );
    });
  });
});
