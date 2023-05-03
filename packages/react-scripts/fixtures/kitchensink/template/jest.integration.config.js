'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/integration/*.test.js'],
  transform: { '^.+\\.js$': './jest.transform.js' },
};
