import { unmap } from '../utils/unmapper';
import { parse } from '../utils/parser';
import fs from 'fs';
import { resolve } from 'path';

test('basic warning', async () => {
  expect.assertions(2);
  const error = `Warning: Each child in an array or iterator should have a unique "key" prop. Check the render method of \`B\`. See https://fb.me/react-warning-keys for more information.
    in div (at B.js:8)
    in B (at A.js:6)
    in A (at App.js:8)
    in div (at App.js:10)
    in App (at index.js:6)`;

  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle_u.mjs'))
      .toString('utf8')
  );
  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle_u.mjs.map'))
      .toString('utf8')
  );
  const frames = await unmap('/static/js/bundle.js', parse(error), 0);

  const expected = JSON.parse(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle2.json'))
      .toString('utf8')
  );
  expect(frames).toEqual(expected);

  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle_u.mjs'))
      .toString('utf8')
  );
  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle_u.mjs.map'))
      .toString('utf8')
  );
  expect(await unmap('/static/js/bundle.js', expected)).toEqual(expected);
});

test('default context & unfound source', async () => {
  expect.assertions(1);
  const error = `Warning: Each child in an array or iterator should have a unique "key" prop. Check the render method of \`B\`. See https://fb.me/react-warning-keys for more information.
    in div (at B.js:8)
    in unknown (at blabla.js:10)`;

  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle_u.mjs'))
      .toString('utf8')
  );
  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle_u.mjs.map'))
      .toString('utf8')
  );
  const frames = await unmap('/static/js/bundle.js', parse(error));
  expect(frames).toMatchSnapshot();
});
