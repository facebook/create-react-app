module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/integration/*.test.js'],
  transform: { '^.+\\.js$': [require.resolve('@swc/jest')] },
};
