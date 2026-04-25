/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Required files that every valid CRA template must contain
const REQUIRED_TEMPLATE_FILES = ['src/index.js', 'public/index.html'];

// Alternative required files (TypeScript templates)
const ALTERNATIVE_REQUIRED_FILES = {
  'src/index.js': ['src/index.tsx', 'src/index.ts'],
};

// Blocked package.json keys that templates must not override
const BLOCKED_PACKAGE_JSON_KEYS = [
  'name',
  'version',
  'license',
  'author',
  'homepage',
  'bugs',
  'repository',
  'funding',
  'engines',
  'os',
  'cpu',
];

// Known dependency conflicts with react-scripts
const CONFLICTING_DEPENDENCIES = [
  'webpack',
  'webpack-dev-server',
  'babel-loader',
  'css-loader',
  'style-loader',
  'file-loader',
  'url-loader',
  'eslint-config-react-app',
];

// Valid script hook names that templates may define
const VALID_SCRIPT_HOOKS = ['start', 'build', 'test', 'eject'];

// Dangerous path patterns that indicate path traversal
const DANGEROUS_PATH_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /^\//, // absolute unix paths
  /^[A-Za-z]:\\/, // absolute windows paths
  /~\//, // home directory references
];

/**
 * Validates that a template directory has the required structure.
 * @param {string} templateDir - Absolute path to the template directory
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
function validateTemplateStructure(templateDir) {
  const errors = [];
  const warnings = [];

  if (!templateDir || typeof templateDir !== 'string') {
    errors.push('Template directory path must be a non-empty string.');
    return { isValid: false, errors, warnings };
  }

  // Check template directory exists
  if (!fs.existsSync(templateDir)) {
    errors.push(`Template directory does not exist: ${templateDir}`);
    return { isValid: false, errors, warnings };
  }

  // Check for required files, allowing alternatives
  for (const requiredFile of REQUIRED_TEMPLATE_FILES) {
    const fullPath = path.join(templateDir, requiredFile);
    const alternatives = ALTERNATIVE_REQUIRED_FILES[requiredFile] || [];
    const alternativePaths = alternatives.map(alt =>
      path.join(templateDir, alt)
    );

    const exists =
      fs.existsSync(fullPath) ||
      alternativePaths.some(altPath => fs.existsSync(altPath));

    if (!exists) {
      const altList = alternatives.length
        ? ` (or ${alternatives.join(', ')})`
        : '';
      errors.push(
        `Missing required template file: ${requiredFile}${altList}. ` +
          `Every CRA template must include this file.`
      );
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validates a template's package.json (template.json) schema.
 * @param {object} templatePackageJson - Parsed template.json content
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
function validatePackageJsonSchema(templatePackageJson) {
  const errors = [];
  const warnings = [];

  if (!templatePackageJson || typeof templatePackageJson !== 'object') {
    errors.push(
      'template.json must be a valid JSON object. ' +
        'See https://create-react-app.dev/docs/custom-templates/ for the expected format.'
    );
    return { isValid: false, errors, warnings };
  }

  // Check for deprecated root-level keys
  if (templatePackageJson.dependencies) {
    warnings.push(
      'Root-level "dependencies" in template.json is deprecated. ' +
        'Move dependencies under "package" key instead.'
    );
  }

  if (templatePackageJson.scripts) {
    warnings.push(
      'Root-level "scripts" in template.json is deprecated. ' +
        'Move scripts under "package" key instead.'
    );
  }

  const packageConfig = templatePackageJson.package || {};

  // Check for blocked keys in the package config
  for (const blockedKey of BLOCKED_PACKAGE_JSON_KEYS) {
    if (packageConfig[blockedKey] !== undefined) {
      errors.push(
        `Template must not override "${blockedKey}" in package.json. ` +
          `This field is managed by create-react-app.`
      );
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Detects dependency conflicts between template deps and react-scripts.
 * @param {object} templateDependencies - Template dependency map
 * @returns {{ conflicts: Array<{ name: string, suggestion: string }> }}
 */
function detectDependencyConflicts(templateDependencies) {
  const conflicts = [];

  if (!templateDependencies || typeof templateDependencies !== 'object') {
    return { conflicts };
  }

  for (const depName of Object.keys(templateDependencies)) {
    if (CONFLICTING_DEPENDENCIES.includes(depName)) {
      conflicts.push({
        name: depName,
        suggestion:
          `"${depName}" is already included in react-scripts. ` +
          `Adding it as a direct dependency may cause version conflicts. ` +
          `Remove it from your template's dependencies.`,
      });
    }
  }

  return { conflicts };
}

/**
 * Validates script hooks defined in the template.
 * @param {object} scripts - Scripts object from template.json package
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
function validateScriptHooks(scripts) {
  const errors = [];
  const warnings = [];

  if (!scripts || typeof scripts !== 'object') {
    return { isValid: true, errors, warnings };
  }

  for (const scriptName of Object.keys(scripts)) {
    if (!VALID_SCRIPT_HOOKS.includes(scriptName)) {
      warnings.push(
        `Unknown script hook "${scriptName}". ` +
          `CRA only supports: ${VALID_SCRIPT_HOOKS.join(', ')}. ` +
          `Custom scripts may not work as expected.`
      );
    }

    const scriptValue = scripts[scriptName];
    if (typeof scriptValue !== 'string') {
      errors.push(
        `Script "${scriptName}" must be a string, got ${typeof scriptValue}.`
      );
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Checks a file path for path traversal attempts.
 * Prevents templates from writing files outside the target directory.
 * @param {string} filePath - The file path to check
 * @param {string} baseDir - The base directory that paths must stay within
 * @returns {{ isSafe: boolean, reason: string | null }}
 */
function checkPathTraversal(filePath, baseDir) {
  if (!filePath || typeof filePath !== 'string') {
    return { isSafe: false, reason: 'File path must be a non-empty string.' };
  }

  if (!baseDir || typeof baseDir !== 'string') {
    return {
      isSafe: false,
      reason: 'Base directory must be a non-empty string.',
    };
  }

  // Check for dangerous path patterns in the raw path
  for (const pattern of DANGEROUS_PATH_PATTERNS) {
    if (pattern.test(filePath)) {
      return {
        isSafe: false,
        reason:
          `Path "${filePath}" contains a potentially dangerous pattern. ` +
          `Template files must use relative paths within the template directory.`,
      };
    }
  }

  // Resolve and verify the path stays within baseDir
  const resolvedPath = path.resolve(baseDir, filePath);
  const normalizedBase = path.resolve(baseDir) + path.sep;

  if (!resolvedPath.startsWith(normalizedBase) && resolvedPath !== path.resolve(baseDir)) {
    return {
      isSafe: false,
      reason:
        `Path "${filePath}" resolves to "${resolvedPath}" which is outside ` +
        `the target directory "${baseDir}". This may be a path traversal attack.`,
    };
  }

  return { isSafe: true, reason: null };
}

/**
 * Scans a template directory for path traversal vulnerabilities.
 * @param {string} templateDir - Path to the template directory to scan
 * @param {string} targetDir - The target app directory
 * @returns {{ isSafe: boolean, unsafeFiles: Array<{ file: string, reason: string }> }}
 */
function scanTemplateForTraversal(templateDir, targetDir) {
  const unsafeFiles = [];

  if (!fs.existsSync(templateDir)) {
    return { isSafe: true, unsafeFiles };
  }

  function walkDir(dir, relativeTo) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      const relativePath = path.relative(relativeTo, entryPath);

      // Check the relative path for traversal
      const result = checkPathTraversal(relativePath, targetDir);
      if (!result.isSafe) {
        unsafeFiles.push({ file: relativePath, reason: result.reason });
      }

      // Check for symlinks pointing outside template
      if (entry.isSymbolicLink()) {
        try {
          const realPath = fs.realpathSync(entryPath);
          const normalizedTemplate =
            path.resolve(templateDir) + path.sep;
          if (
            !realPath.startsWith(normalizedTemplate) &&
            realPath !== path.resolve(templateDir)
          ) {
            unsafeFiles.push({
              file: relativePath,
              reason: `Symlink points to "${realPath}" outside template directory.`,
            });
          }
        } catch {
          unsafeFiles.push({
            file: relativePath,
            reason: 'Unable to resolve symlink target.',
          });
        }
      }

      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        walkDir(entryPath, relativeTo);
      }
    }
  }

  walkDir(templateDir, templateDir);
  return { isSafe: unsafeFiles.length === 0, unsafeFiles };
}

/**
 * Checks template version compatibility with the current CRA version.
 * @param {string | undefined} templateCraVersion - Required CRA version from template
 * @param {string} currentCraVersion - Current CRA version
 * @returns {{ isCompatible: boolean, message: string | null }}
 */
function checkVersionCompatibility(templateCraVersion, currentCraVersion) {
  if (!templateCraVersion) {
    return { isCompatible: true, message: null };
  }

  if (typeof templateCraVersion !== 'string') {
    return {
      isCompatible: false,
      message: 'Template CRA version requirement must be a string.',
    };
  }

  // Simple major version comparison
  const templateMajor = parseInt(templateCraVersion.replace(/[^0-9.]/g, ''), 10);
  const currentMajor = parseInt(currentCraVersion.replace(/[^0-9.]/g, ''), 10);

  if (isNaN(templateMajor) || isNaN(currentMajor)) {
    return {
      isCompatible: true,
      message: 'Unable to parse version numbers for compatibility check.',
    };
  }

  if (templateMajor > currentMajor) {
    return {
      isCompatible: false,
      message:
        `This template requires create-react-app v${templateMajor}.x, ` +
        `but you are using v${currentMajor}.x. ` +
        `Please upgrade create-react-app or choose a compatible template.`,
    };
  }

  return { isCompatible: true, message: null };
}

/**
 * Runs all validations on a template and returns a combined report.
 * @param {string} templateDir - Path to the template's "template" directory
 * @param {object} templateJson - Parsed template.json
 * @param {string} targetDir - Target app directory
 * @param {string} [currentCraVersion='5.0.0'] - Current CRA version
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
function validateTemplate(
  templateDir,
  templateJson,
  targetDir,
  currentCraVersion = '5.0.0'
) {
  const allErrors = [];
  const allWarnings = [];

  // 1. Structure validation
  const structure = validateTemplateStructure(templateDir);
  allErrors.push(...structure.errors);
  allWarnings.push(...structure.warnings);

  // 2. Package.json schema validation
  const schema = validatePackageJsonSchema(templateJson);
  allErrors.push(...schema.errors);
  allWarnings.push(...schema.warnings);

  // 3. Dependency conflict detection
  const packageConfig = (templateJson && templateJson.package) || {};
  const deps = packageConfig.dependencies || {};
  const devDeps = packageConfig.devDependencies || {};
  const depConflicts = detectDependencyConflicts({ ...deps, ...devDeps });
  for (const conflict of depConflicts.conflicts) {
    allWarnings.push(conflict.suggestion);
  }

  // 4. Script hook validation
  const scripts = packageConfig.scripts || {};
  const scriptResult = validateScriptHooks(scripts);
  allErrors.push(...scriptResult.errors);
  allWarnings.push(...scriptResult.warnings);

  // 5. Path traversal scan
  const traversalResult = scanTemplateForTraversal(templateDir, targetDir);
  for (const unsafeFile of traversalResult.unsafeFiles) {
    allErrors.push(
      `Unsafe file detected: ${unsafeFile.file} - ${unsafeFile.reason}`
    );
  }

  // 6. Version compatibility
  const craVersionReq =
    templateJson && templateJson.craVersion
      ? templateJson.craVersion
      : undefined;
  const versionResult = checkVersionCompatibility(
    craVersionReq,
    currentCraVersion
  );
  if (!versionResult.isCompatible) {
    allErrors.push(versionResult.message);
  } else if (versionResult.message) {
    allWarnings.push(versionResult.message);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

module.exports = {
  validateTemplateStructure,
  validatePackageJsonSchema,
  detectDependencyConflicts,
  validateScriptHooks,
  checkPathTraversal,
  scanTemplateForTraversal,
  checkVersionCompatibility,
  validateTemplate,
  REQUIRED_TEMPLATE_FILES,
  BLOCKED_PACKAGE_JSON_KEYS,
  CONFLICTING_DEPENDENCIES,
  VALID_SCRIPT_HOOKS,
};
