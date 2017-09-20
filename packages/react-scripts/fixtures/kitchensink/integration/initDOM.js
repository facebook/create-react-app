/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const fs = require('fs');
const http = require('http');
const jsdom = require('jsdom');
const path = require('path');
const { expect } = require('chai');

let getMarkup;
let resourceLoader;

if (process.env.E2E_FILE) {
  const file = path.isAbsolute(process.env.E2E_FILE)
    ? process.env.E2E_FILE
    : path.join(process.cwd(), process.env.E2E_FILE);

  const markup = fs.readFileSync(file, 'utf8');
  getMarkup = () => markup;

  const pathPrefix = process.env.PUBLIC_URL.replace(/^https?:\/\/[^/]+\/?/, '');

  resourceLoader = (resource, callback) =>
    callback(
      null,
      fs.readFileSync(
        path.join(
          path.dirname(file),
          resource.url.pathname.replace(pathPrefix, '')
        ),
        'utf8'
      )
    );
} else if (process.env.E2E_URL) {
  getMarkup = () =>
    new Promise(resolve => {
      http.get(process.env.E2E_URL, res => {
        let rawData = '';
        res.on('data', chunk => (rawData += chunk));
        res.on('end', () => resolve(rawData));
      });
    });

  resourceLoader = (resource, callback) => resource.defaultFetch(callback);
} else {
  it.only(
    'can run jsdom (at least one of "E2E_FILE" or "E2E_URL" environment variables must be provided)',
    () => {
      expect(
        new Error("This isn't the error you are looking for.")
      ).to.be.undefined();
    }
  );
}

export default feature =>
  new Promise(async resolve => {
    const markup = await getMarkup();
    const host = process.env.E2E_URL || 'http://www.example.org/spa:3000';
    const doc = jsdom.jsdom(markup, {
      features: {
        FetchExternalResources: ['script', 'css'],
        ProcessExternalResources: ['script'],
      },
      created: (_, win) =>
        win.addEventListener('ReactFeatureDidMount', () => resolve(doc), true),
      deferClose: true,
      resourceLoader,
      url: `${host}#${feature}`,
      virtualConsole: jsdom.createVirtualConsole().sendTo(console),
    });

    doc.close();
  });
