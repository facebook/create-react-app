/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const getCSSModuleLocalIdent = require('../getCSSModuleLocalIdent');

const rootContext = '/path';
const defaultClassName = 'class';
const defaultOptions = {
  context: undefined,
  hashSalt: undefined,
  regExp: null,
};

const tests = [
  {
    resourcePath: '/path/to/file.module.css',
    expected: 'file_class__jqNYY',
  },
  {
    resourcePath: '/path/to/file.module.scss',
    expected: 'file_class__BjEjJ',
  },
  {
    resourcePath: '/path/to/file.module.sass',
    expected: 'file_class__dINZX',
  },
  {
    resourcePath: '/path/to/file.module.sass',
    expected: 'file_class__9vVbt',
    options: {
      hashSalt: 'my-app',
    },
  },
  {
    resourcePath: '/path/to/file.name.module.css',
    expected: 'file_name_class__XpUJW',
  },
  {
    resourcePath: '/path/to/file.name.module.css',
    expected: 'file_name_class__OS1Yg',
    options: {
      hashSalt: 'my-app',
    },
  },
  {
    resourcePath: '/path/to/file.name.module.css',
    expected: 'file_name_class__uMbcn',
    options: {
      hashSalt: 'my-app-123',
    },
  },
  {
    resourcePath: '/path/a/b/c/file.name.module.css',
    className: 'test',
    expected: 'file_name_test__2F_aq',
    description:
      'Verifies that hash is encoded with base64url (2F_aq instead of 2F/aq)',
  },
  {
    resourcePath: '/path/a/b/file.name.module.css',
    className: 'test',
    expected: 'file_name_test__58Gc-',
    description:
      'Verifies that hash is encoded with base64url (58Gc- instead of 58Gc+)',
  },
];

describe('getCSSModuleLocalIdent', () => {
  tests.forEach(test => {
    const {
      className = defaultClassName,
      expected,
      resourcePath,
      options = defaultOptions,
      description,
    } = test;
    const testDescription =
      description || JSON.stringify({ resourcePath, className });

    it(testDescription, () => {
      const ident = getCSSModuleLocalIdent(
        {
          resourcePath,
          rootContext,
        },
        '[hash:base64]',
        className,
        options
      );
      expect(ident).toBe(expected);
    });
  });
});
