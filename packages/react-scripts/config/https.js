// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');
const paths = require('./paths');

// Ensure the certificate and key provided are valid and if not
// throw an easy to debug error
function validateKeyAndCerts({ cert, key, keyFile, crtFile }) {
  let encrypted;
  try {
    // publicEncrypt will throw an error with an invalid cert
    encrypted = crypto.publicEncrypt(cert, Buffer.from('test'));
  } catch (err) {
    throw new Error(`The certificate "${chalk.yellow(crtFile)}" is invalid.`);
  }

  try {
    // privateDecrypt will throw an error with an invalid key
    crypto.privateDecrypt(key, encrypted);
  } catch (err) {
    throw new Error(
      `The certificate key "${chalk.yellow(keyFile)}" is invalid.`
    );
  }
}

// Get the https config
// Return cert files if provided in env, otherwise just true or false
function httpsConfig() {
  const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
  const https = HTTPS === 'true';

  if (https && SSL_CRT_FILE && SSL_KEY_FILE) {
    const crtFile = path.resolve(paths.appPath, SSL_CRT_FILE);
    const keyFile = path.resolve(paths.appPath, SSL_KEY_FILE);
    if (!fs.existsSync(crtFile)) {
      throw new Error(
        `You specified ${chalk.cyan(
          'SSL_CRT_FILE'
        )} in your env, but the file "${chalk.yellow(crtFile)}" doesn't exist.`
      );
    }
    if (!fs.existsSync(keyFile)) {
      throw new Error(
        `You specified ${chalk.cyan(
          'SSL_KEY_FILE'
        )} in your env, but the file "${chalk.yellow(keyFile)}" doesn't exist.`
      );
    }
    const config = {
      key: fs.readFileSync(keyFile),
      cert: fs.readFileSync(crtFile),
    };

    validateKeyAndCerts({ ...config, keyFile, crtFile });
    return config;
  }
  return https;
}

module.exports = httpsConfig;
