/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  validateTemplateStructure,
  validatePackageJsonSchema,
  detectDependencyConflicts,
  validateScriptHooks,
  checkPathTraversal,
  checkVersionCompatibility,
  validateTemplate,
} = require('../templateValidator');

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cra-template-test-'));
}

function cleanupDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('validateTemplateStructure', () => {
  let tempDir;

  afterEach(() => {
    if (tempDir) {
      cleanupDir(tempDir);
      tempDir = null;
    }
  });

  it('rejects empty path', () => {
    const result = validateTemplateStructure('');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects non-existent directory', () => {
    const result = validateTemplateStructure('/nonexistent/path');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('does not exist');
  });

  it('reports missing required files', () => {
    tempDir = createTempDir();
    const result = validateTemplateStructure(tempDir);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(2); // src/index.js and public/index.html
  });

  it('accepts valid template with all required files', () => {
    tempDir = createTempDir();
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'public'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'src', 'index.js'), '');
    fs.writeFileSync(path.join(tempDir, 'public', 'index.html'), '');

    const result = validateTemplateStructure(tempDir);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('accepts TypeScript alternative files', () => {
    tempDir = createTempDir();
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'public'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'src', 'index.tsx'), '');
    fs.writeFileSync(path.join(tempDir, 'public', 'index.html'), '');

    const result = validateTemplateStructure(tempDir);
    expect(result.isValid).toBe(true);
  });
});

describe('validatePackageJsonSchema', () => {
  it('rejects null input', () => {
    const result = validatePackageJsonSchema(null);
    expect(result.isValid).toBe(false);
  });

  it('rejects non-object input', () => {
    const result = validatePackageJsonSchema('not an object');
    expect(result.isValid).toBe(false);
  });

  it('accepts valid empty template.json', () => {
    const result = validatePackageJsonSchema({});
    expect(result.isValid).toBe(true);
  });

  it('warns about deprecated root-level dependencies', () => {
    const result = validatePackageJsonSchema({
      dependencies: { react: '^18.0.0' },
    });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('deprecated');
  });

  it('rejects blocked keys in package config', () => {
    const result = validatePackageJsonSchema({
      package: { name: 'my-hacked-app' },
    });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('name');
  });

  it('rejects multiple blocked keys', () => {
    const result = validatePackageJsonSchema({
      package: { name: 'x', version: '1.0.0', license: 'EVIL' },
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(3);
  });

  it('accepts valid package with allowed keys', () => {
    const result = validatePackageJsonSchema({
      package: {
        dependencies: { axios: '^1.0.0' },
        scripts: { start: 'react-scripts start' },
      },
    });
    expect(result.isValid).toBe(true);
  });
});

describe('detectDependencyConflicts', () => {
  it('returns empty for null input', () => {
    const result = detectDependencyConflicts(null);
    expect(result.conflicts.length).toBe(0);
  });

  it('detects webpack conflict', () => {
    const result = detectDependencyConflicts({ webpack: '^5.0.0' });
    expect(result.conflicts.length).toBe(1);
    expect(result.conflicts[0].name).toBe('webpack');
  });

  it('detects multiple conflicts', () => {
    const result = detectDependencyConflicts({
      webpack: '^5.0.0',
      'babel-loader': '^9.0.0',
    });
    expect(result.conflicts.length).toBe(2);
  });

  it('allows non-conflicting dependencies', () => {
    const result = detectDependencyConflicts({
      axios: '^1.0.0',
      lodash: '^4.0.0',
    });
    expect(result.conflicts.length).toBe(0);
  });
});

describe('validateScriptHooks', () => {
  it('accepts null scripts', () => {
    const result = validateScriptHooks(null);
    expect(result.isValid).toBe(true);
  });

  it('accepts valid script hooks', () => {
    const result = validateScriptHooks({
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
    });
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBe(0);
  });

  it('warns about unknown script hooks', () => {
    const result = validateScriptHooks({
      start: 'react-scripts start',
      deploy: 'custom-deploy',
    });
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain('deploy');
  });

  it('rejects non-string script values', () => {
    const result = validateScriptHooks({
      start: 123,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('string');
  });
});

describe('checkPathTraversal', () => {
  it('detects ../ traversal', () => {
    const result = checkPathTraversal('../etc/passwd', '/app');
    expect(result.isSafe).toBe(false);
  });

  it('detects ..\\ traversal', () => {
    const result = checkPathTraversal('..\\windows\\system32', 'C:\\app');
    expect(result.isSafe).toBe(false);
  });

  it('allows safe relative paths', () => {
    const result = checkPathTraversal('src/index.js', '/app');
    expect(result.isSafe).toBe(true);
  });

  it('rejects empty path', () => {
    const result = checkPathTraversal('', '/app');
    expect(result.isSafe).toBe(false);
  });

  it('rejects empty base dir', () => {
    const result = checkPathTraversal('file.js', '');
    expect(result.isSafe).toBe(false);
  });

  it('allows nested safe paths', () => {
    const result = checkPathTraversal('src/components/App.js', '/app');
    expect(result.isSafe).toBe(true);
  });
});

describe('checkVersionCompatibility', () => {
  it('returns compatible for undefined version requirement', () => {
    const result = checkVersionCompatibility(undefined, '5.0.0');
    expect(result.isCompatible).toBe(true);
  });

  it('returns compatible for matching major version', () => {
    const result = checkVersionCompatibility('5.0.0', '5.0.1');
    expect(result.isCompatible).toBe(true);
  });

  it('rejects newer major version requirement', () => {
    const result = checkVersionCompatibility('6.0.0', '5.0.0');
    expect(result.isCompatible).toBe(false);
    expect(result.message).toContain('upgrade');
  });

  it('allows older major version requirement', () => {
    const result = checkVersionCompatibility('4.0.0', '5.0.0');
    expect(result.isCompatible).toBe(true);
  });

  it('handles non-string version gracefully', () => {
    const result = checkVersionCompatibility(123, '5.0.0');
    expect(result.isCompatible).toBe(false);
  });
});

describe('validateTemplate (integration)', () => {
  let tempDir;

  afterEach(() => {
    if (tempDir) {
      cleanupDir(tempDir);
      tempDir = null;
    }
  });

  it('validates a fully valid template', () => {
    tempDir = createTempDir();
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'public'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'src', 'index.js'), '');
    fs.writeFileSync(path.join(tempDir, 'public', 'index.html'), '');

    const templateJson = {
      package: {
        dependencies: { axios: '^1.0.0' },
        scripts: { start: 'react-scripts start' },
      },
    };

    const result = validateTemplate(tempDir, templateJson, tempDir, '5.0.0');
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('collects errors from multiple validations', () => {
    tempDir = createTempDir();
    // Missing required files + blocked package.json key
    const templateJson = {
      package: { name: 'hacked' },
      craVersion: '99.0.0',
    };

    const result = validateTemplate(tempDir, templateJson, tempDir, '5.0.0');
    expect(result.isValid).toBe(false);
    // Should have structure errors + schema errors + version error
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
