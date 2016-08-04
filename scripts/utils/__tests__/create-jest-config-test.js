const createConfig = require('../create-jest-config');

describe('create-jest-config', () => {

  it('creates a config object', () => {
    expect(createConfig({}, id => '<rootDir>/' + id)).toMatchSnapshot();
  });

  it('overwrites default options', () => {
    expect(createConfig(
      {
        testEnvironment: 'jest-environment-jsdom',
      },
      id => id
    ).testEnvironment).toBe('jest-environment-jsdom');
  });

  it('merges `setupFiles` and `moduleNameMapper` options', () => {
    expect(createConfig(
      {
        setupFiles: ['a'],
        moduleNameMapper: {
          b: 'c',
        },
      },
      id => id
    )).toMatchSnapshot();
  });

});
