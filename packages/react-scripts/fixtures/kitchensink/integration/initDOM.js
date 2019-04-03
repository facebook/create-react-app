/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require('fs');
const { JSDOM, ResourceLoader } = require('jsdom');
const path = require('path');

export let fetchFile;

if (process.env.E2E_FILE) {
  const file = path.isAbsolute(process.env.E2E_FILE)
    ? process.env.E2E_FILE
    : path.join(process.cwd(), process.env.E2E_FILE);

  const pathPrefix = process.env.PUBLIC_URL.replace(/^https?:\/\/[^/]+\/?/, '');

  const fetchFile = url =>
    fs.readFileSync(
      path.join(path.dirname(file), url.pathname.replace(pathPrefix, '')),
      'utf8'
    );

  fileResourceLoader = new class FileResourceLoader extends ResourceLoader {
    fetch(url, options) {
      return Promise.resolve(fetchFile(url));
    }
  }();
}

if (!process.env.E2E_FILE && !process.env.E2E_URL) {
  it.only('can run jsdom (at least one of "E2E_FILE" or "E2E_URL" environment variables must be provided)', () => {
    expect(
      new Error("This isn't the error you are looking for.")
    ).toBeUndefined();
  });
}

export default feature =>
  new Promise(async (resolve, reject) => {
    try {
      const host = process.env.E2E_URL || 'http://www.example.org/spa:3000';
      const url = `${host}#${feature}`;

      let window;

      if (process.env.E2E_FILE) {
        window = (await JSDOM.fromFile(file, {
          pretendToBeVisual: true,
          resources: fileResourceLoader,
          runScripts: 'dangerously',
          url,
        })).window;
      } else {
        window = (await JSDOM.fromURL(url, {
          pretendToBeVisual: true,
          resources: 'usable',
          runScripts: 'dangerously',
        })).window;
      }

      const { document } = window;

      document.addEventListener(
        'ReactFeatureDidMount',
        () => resolve(document),
        true
      );
      document.addEventListener(
        'ReactFeatureError',
        () => reject(`Error loading feature: ${feature}`),
        true
      );
    } catch (e) {
      reject(e);
    }
  });
