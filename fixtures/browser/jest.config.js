module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['/src/', 'node_modules'],
  setupTestFrameworkScriptFile: './setupBrowserTests.js',
  forceExit: true,
};
