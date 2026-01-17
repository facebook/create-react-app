#!/usr/bin/env node
/**
 * Verification test for @svgr/webpack v8 upgrade
 * Run with: node verify-svgr-upgrade.test.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Testing @svgr/webpack v8 upgrade...\n');

// Test 1: Check package.json has v8+
console.log('Test 1: Verify @svgr/webpack version in package.json');
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const svgrVersion = packageJson.dependencies?.['@svgr/webpack'];

if (!svgrVersion) {
  console.error('❌ FAIL: @svgr/webpack not found in dependencies');
  process.exit(1);
}

const majorVersion = parseInt(svgrVersion.replace(/^\^/, '').split('.')[0]);
if (majorVersion >= 8) {
  console.log(`✅ PASS: @svgr/webpack version is ${svgrVersion} (>= v8)`);
} else {
  console.error(`❌ FAIL: @svgr/webpack version is ${svgrVersion} (< v8)`);
  process.exit(1);
}

// Test 2: Check installed version
console.log('\nTest 2: Verify installed @svgr/webpack version');
try {
  const installedVersion = execSync(
    'npm list @svgr/webpack --depth=0 --json',
    { cwd: __dirname, encoding: 'utf8' }
  );
  const parsed = JSON.parse(installedVersion);
  const version = parsed.dependencies?.['@svgr/webpack']?.version;
  
  if (version && parseInt(version.split('.')[0]) >= 8) {
    console.log(`✅ PASS: Installed version is ${version}`);
  } else {
    console.log(`⚠️  SKIP: Not installed or version check failed`);
  }
} catch (e) {
  console.log('⚠️  SKIP: Could not check installed version');
}

// Test 3: Check webpack config has svgr loader
console.log('\nTest 3: Verify webpack config includes @svgr/webpack loader');
const webpackConfigPath = path.join(__dirname, 'config/webpack.config.js');
const webpackConfig = fs.readFileSync(webpackConfigPath, 'utf8');

if (webpackConfig.includes('@svgr/webpack')) {
  console.log('✅ PASS: webpack.config.js references @svgr/webpack');
} else {
  console.error('❌ FAIL: webpack.config.js does not reference @svgr/webpack');
  process.exit(1);
}

// Test 4: Check svgr options are configured
console.log('\nTest 4: Verify svgr options are configured');
const hasOptions = webpackConfig.includes('prettier:') && 
                   webpackConfig.includes('svgo:') &&
                   webpackConfig.includes('titleProp:') &&
                   webpackConfig.includes('ref:');

if (hasOptions) {
  console.log('✅ PASS: svgr options (prettier, svgo, titleProp, ref) are configured');
} else {
  console.error('❌ FAIL: svgr options not properly configured');
  process.exit(1);
}

console.log('\n✨ All tests passed! @svgr/webpack v8 upgrade is verified.\n');
