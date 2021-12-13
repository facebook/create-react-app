const useSwc = process.env.SWC_TRANSFORM === 'true';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/integration/*.test.js'],
  transform: {
    '^.+\\.js$': useSwc
      ? [require.resolve('@swc/jest')]
      : './jest.transform.js',
  },
};
