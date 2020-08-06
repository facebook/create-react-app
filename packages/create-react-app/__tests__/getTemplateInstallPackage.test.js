/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { getTemplateInstallPackage } = require('../createReactApp');

describe('getTemplateInstallPackage', () => {
  it('no options gives cra-template', async () => {
    await expect(getTemplateInstallPackage()).resolves.toBe('cra-template');
  });

  it('cra-template gives cra-template', async () => {
    await expect(getTemplateInstallPackage('cra-template')).resolves.toBe(
      'cra-template'
    );
  });

  it('cra-template-typescript gives cra-template-typescript', async () => {
    await expect(getTemplateInstallPackage('cra-template-typescript')).resolves.toBe(
      'cra-template-typescript'
    );
  });

  it('typescript gives cra-template-typescript', async () => {
    await expect(getTemplateInstallPackage('typescript')).resolves.toBe(
      'cra-template-typescript'
    );
  });

  it('typescript@next gives cra-template-typescript@next', async () => {
    await expect(getTemplateInstallPackage('cra-template-typescript@next')).resolves.toBe(
      'cra-template-typescript@next'
    );
  });

  it('cra-template@next gives cra-template@next', async () => {
    await expect(getTemplateInstallPackage('cra-template@next')).resolves.toBe(
      'cra-template@next'
    );
  });

  it('cra-template-typescript@next gives cra-template-typescript@next', async () => {
    await expect(getTemplateInstallPackage('cra-template-typescript@next')).resolves.toBe(
      'cra-template-typescript@next'
    );
  });

  it('@iansu gives @iansu/cra-template', async () => {
    await expect(getTemplateInstallPackage('@iansu')).resolves.toBe(
      '@iansu/cra-template'
    );
  });

  it('@iansu/cra-template gives @iansu/cra-template', async () => {
    await expect(
      getTemplateInstallPackage('@iansu/cra-template')
    ).resolves.toBe('@iansu/cra-template');
  });

  it('@iansu/cra-template@next gives @iansu/cra-template@next', async () => {
    await expect(
      getTemplateInstallPackage('@iansu/cra-template@next')
    ).resolves.toBe('@iansu/cra-template@next');
  });

  it('@iansu/cra-template-typescript@next gives @iansu/cra-template-typescript@next', async () => {
    await expect(getTemplateInstallPackage('@iansu/cra-template-typescript@next')).resolves.toBe(
      '@iansu/cra-template-typescript@next'
    );
  });

  it('http://example.com/cra-template.tar.gz gives http://example.com/cra-template.tar.gz', async () => {
    await expect(
      getTemplateInstallPackage('http://example.com/cra-template.tar.gz')
    ).resolves.toBe('http://example.com/cra-template.tar.gz');
  });
});
