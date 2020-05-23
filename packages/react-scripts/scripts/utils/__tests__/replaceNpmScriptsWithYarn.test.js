'use strict';

const replaceNpmScriptsWithYarn = require('../replaceNpmScriptsWithYarn');

describe('replaceNpmScriptsWithYarn util function', () => {
  test('replaces single npm scripts with yarn', () => {
    const scripts = {
      test: 'npm run test',
      example: 'npm example',
    };

    const actual = replaceNpmScriptsWithYarn(scripts);
    const expected = {
      test: 'yarn test',
      example: 'yarn example',
    };

    expect(actual).toEqual(expected);
  });

  test('replaces chained npm scripts with yarn', () => {
    const scripts = {
      'pre-commit': 'npm run prettier && npm run lint && npm test',
    };

    const actual = replaceNpmScriptsWithYarn(scripts);
    const expected = {
      'pre-commit': 'yarn prettier && yarn lint && yarn test',
    };

    expect(actual).toEqual(expected);
  });
});
