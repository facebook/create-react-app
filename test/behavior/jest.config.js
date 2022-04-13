'use strict';

module.exports = {
  testTimeout: 60 * 1000,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/__fixtures__/'],
};
