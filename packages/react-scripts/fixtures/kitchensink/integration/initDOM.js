/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require('fs');
const { JSDOM, ResourceLoader } = require('jsdom');
const path = require('path');
const url = require('url');

const file =
  process.env.E2E_FILE &&
  (path.isAbsolute(process.env.E2E_FILE)
    ? process.env.E2E_FILE
    : path.join(process.cwd(), process.env.E2E_FILE));

export const fetchFile = url => {
  const pathPrefix = process.env.PUBLIC_URL.replace(/^https?:\/\/[^/]+\/?/, '');
  return fs.readFileSync(
    path.join(path.dirname(file), url.pathname.replace(pathPrefix, '')),
    'utf8'
  );
};

const fileResourceLoader = new (class FileResourceLoader extends ResourceLoader {
  fetch(href, options) {
    return Promise.resolve(fetchFile(url.parse(href)));
  }
})();

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
        window = (
          await JSDOM.fromFile(file, {
            pretendToBeVisual: true,
            resources: fileResourceLoader,
            runScripts: 'dangerously',
            url,
          })
        ).window;
      } else {
        window = (
          await JSDOM.fromURL(url, {
            pretendToBeVisual: true,
            resources: 'usable',
            runScripts: 'dangerously',
          })
        ).window;
      }

      const cleanup = () => {
        if (window) {
          window.close();
          window = null;
        }
      };

      const { document } = window;

      const cancelToken = setTimeout(() => {
        // Cleanup jsdom instance since we don't need it anymore
        cleanup();

        reject(`Timed out loading feature: ${feature}`);
      }, 10000);

      document.addEventListener(
        'ReactFeatureDidMount',
        () => resolve(document),
        { capture: true, once: true }
      );
      document.addEventListener(
        'ReactFeatureError',
        () => {
          clearTimeout(cancelToken);

          // Cleanup jsdom instance since we don't need it anymore
          cleanup();

          reject(`Error loading feature: ${feature}`);
        },
        { capture: true, once: true }
      );
    } catch (e) {
      reject(e);
    }
  });
