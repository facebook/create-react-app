/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// We use eslint-loader so even warnings are very visible.
// This is why we prefer to use "WARNING" level for potential errors,
// and we try not to use "ERROR" level at all.

module.exports = {
  plugins: ['jest'],
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
      env: {
        'jest/globals': true,
      },
      // A subset of the recommended rules:
      // https://github.com/jest-community/eslint-plugin-jest#rules
      rules: {
        'jest/expect-expect': 'warn',
        'jest/no-identical-title': 'warn',
        'jest/valid-describe': 'warn',
        'jest/valid-expect': 'warn',
        'jest/valid-expect-in-promise': 'warn',
      },
    },
  ],
};
