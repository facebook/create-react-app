'use strict';

module.exports = {
  testTimeout: 1000 * 60 * (process.env.RUNNER_OS === 'macOS' ? 10 : 5),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/__fixtures__/'],
};
