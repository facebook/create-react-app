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
  expect(frames).toEqual([
    {
      functionName: 'div',
      fileName: '/static/js/bundle.js',
      lineNumber: 41466,
      columnNumber: null,
      _originalFunctionName: 'div',
      _originalFileName: 'B.js',
      _originalLineNumber: 8,
      _originalColumnNumber: null,
      _scriptCode: [
        {
          lineNumber: 41463,
          content: '        },',
          highlight: false,
        },
        {
          lineNumber: 41464,
          content: '        [1, 2].map(function (v) {',
          highlight: false,
        },
        {
          lineNumber: 41465,
          content: '          return _react2.default.createElement(',
          highlight: false,
        },
        {
          lineNumber: 41466,
          content: "            'div',",
          highlight: true,
        },
        {
          lineNumber: 41467,
          content: '            {',
          highlight: false,
        },
        {
          lineNumber: 41468,
          content: '              __source: {',
          highlight: false,
        },
        {
          lineNumber: 41469,
          content: '                fileName: _jsxFileName,',
          highlight: false,
        },
      ],
      _originalScriptCode: [
        {
          lineNumber: 5,
          content: '    return (',
          highlight: false,
        },
        {
          lineNumber: 6,
          content: '      <div>',
          highlight: false,
        },
        {
          lineNumber: 7,
          content: '        {[1, 2].map(v => (',
          highlight: false,
        },
        {
          lineNumber: 8,
          content: '          <div>{v}</div>',
          highlight: true,
        },
        {
          lineNumber: 9,
          content: '        ))}',
          highlight: false,
        },
        {
          lineNumber: 10,
          content: '      </div>',
          highlight: false,
        },
        {
          lineNumber: 11,
          content: '    )',
          highlight: false,
        },
      ],
    },
    {
      functionName: null,
      fileName: null,
      lineNumber: null,
      columnNumber: null,
      _originalFunctionName: 'unknown',
      _originalFileName: 'blabla.js',
      _originalLineNumber: 10,
      _originalColumnNumber: null,
      _scriptCode: null,
      _originalScriptCode: null,
    },
  ]);
});
