/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const formatWebpackMessages = require('../formatWebpackMessages');

// TODO: test these messages by actually running a build so we can validate
// webpack upgrades didn't break any of our massaging
describe('formats various webpack errors correctly', () => {
  it('invalid js syntax (babel)', () => {
    const json = {
      errors: [
        './template/src/App.js\nModule Error (from /Users/joe/Documents/Development/OSS/create-react-app/node_modules/thread-loader/dist/cjs.js):\n\n  Line 10:  Parsing error: Expected corresponding JSX closing tag for <div>\n\n   8 |   render() {\n   9 |     return (\n> 10 |       <div className="App"></p>\n     |                            ^\n  11 |         <header className="App-header">\n  12 |           <img src={logo} className="App-logo" alt="logo" />\n  13 |           <p>\n\n\n @ ./template/src/index.js 1:77-100 1:182-185\n @ multi ./config/polyfills.js ./template/src/index.js',
        './template/src/App.js\nModule build failed (from /Users/joe/Documents/Development/OSS/create-react-app/node_modules/thread-loader/dist/cjs.js):\nThread Loader (Worker 0)\n/Users/joe/Documents/Development/OSS/create-react-app/packages/react-scripts/template/src/App.js: Expected corresponding JSX closing tag for <div> (10:27)\n\n   8 |   render() {\n   9 |     return (\n> 10 |       <div className="App"></p>\n     |                            ^\n  11 |         <header className="App-header">\n  12 |           <img src={logo} className="App-logo" alt="logo" />\n  13 |           <p>\n\n    at _class.raise (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:779:15)\n    at _class.jsxParseElementAt (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:8111:18)\n    at _class.jsxParseElement (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:8137:19)\n    at _class.parseExprAtom (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:8144:21)\n    at _class.parseExprSubscripts (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:2758:21)\n    at _class.parseMaybeUnary (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:2737:21)\n    at _class.parseExprOps (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:2646:21)\n    at _class.parseMaybeConditional (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:2618:21)\n    at _class.parseMaybeAssign (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:2565:21)\n    at _class.parseMaybeAssign (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/@babel/core/node_modules/babylon/lib/index.js:7270:57)\n @ ./template/src/index.js 1:77-100 1:182-185\n @ multi ./config/polyfills.js ./template/src/index.js',
      ],
      warnings: [],
    };

    expect(formatWebpackMessages(json)).toMatchSnapshot();
  });

  it('invalid css syntax', () => {
    const json = {
      errors: [
        './template/src/App.css\nModule build failed (from /Users/joe/Documents/Development/OSS/create-react-app/node_modules/mini-css-extract-plugin/dist/loader.js):\nModuleBuildError: Module build failed (from /Users/joe/Documents/Development/OSS/create-react-app/node_modules/postcss-loader/lib/index.js):\nSyntax Error \n\n(19:1) Unexpected }\n\n  17 |   font-size: calc(10px + 2vmin);\n  18 |   color: white;\n> 19 | }\n     | ^\n  20 | \n  21 | .App-link {\n\n    at runLoaders (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/webpack/lib/NormalModule.js:286:20)\n    at /Users/joe/Documents/Development/OSS/create-react-app/node_modules/loader-runner/lib/LoaderRunner.js:364:11\n    at /Users/joe/Documents/Development/OSS/create-react-app/node_modules/loader-runner/lib/LoaderRunner.js:230:18\n    at context.callback (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/loader-runner/lib/LoaderRunner.js:111:13)\n    at Promise.resolve.then.then.catch (/Users/joe/Documents/Development/OSS/create-react-app/node_modules/postcss-loader/lib/index.js:194:44)\n    at <anonymous>\n @ ./template/src/App.js 1:1905-1923\n @ ./template/src/index.js\n @ multi ./config/polyfills.js ./template/src/index.js',
      ],
      warnings: [],
    };

    expect(formatWebpackMessages(json)).toMatchSnapshot();
  });

  it('module not found', () => {
    const json = {
      errors: [
        "./template/src/App.js\nModule not found: Error: Can't resolve 'blabla' in '/Users/joe/Documents/Development/OSS/create-react-app/packages/react-scripts/template/src'\n @ ./template/src/App.js 5:0-25\n @ ./template/src/index.js\n @ multi ./config/polyfills.js ../react-dev-utils/webpackHotDevClient.js ./template/src/index.js",
      ],
      warnings: [
        "./template/src/App.js\nModule Warning (from /Users/joe/Documents/Development/OSS/create-react-app/node_modules/thread-loader/dist/cjs.js):\n\n  \u001b[1mLine 5:\u001b[22m  'bla' is defined but never used  \u001b[33m\u001b[4mno-unused-vars\u001b[24m\u001b[39m\n\n\n @ ./template/src/index.js 5:0-24 7:36-39\n @ multi ./config/polyfills.js ../react-dev-utils/webpackHotDevClient.js ./template/src/index.js",
      ],
    };

    expect(formatWebpackMessages(json)).toMatchSnapshot();
  });

  it('eslint errors', () => {
    const json = {
      errors: [
        "./template/src/App.js\nModule Error (from /Users/joe/Documents/Development/OSS/create-react-app/node_modules/thread-loader/dist/cjs.js):\n\n  \u001b[1mLine 8:\u001b[22m  'c' is not defined  \u001b[31m\u001b[4mno-undef\u001b[24m\u001b[39m\n\nSearch for the \u001b[4m\u001b[31mkeywords\u001b[39m\u001b[24m to learn more about each error.\n @ ./template/src/index.js 1:77-100 1:182-185\n @ multi ./config/polyfills.js ./template/src/index.js",
      ],
      warnings: [],
    };

    expect(formatWebpackMessages(json)).toMatchSnapshot();
  });

  it('eslint warning', () => {
    const json = {
      errors: [],
      warnings: [
        "./template/src/App.js\nModule Warning (from /Users/joe/Documents/Development/OSS/create-react-app/node_modules/thread-loader/dist/cjs.js):\n\n  \u001b[1mLine 7:\u001b[22m  'unUsed' is defined but never used  \u001b[33m\u001b[4mno-unused-vars\u001b[24m\u001b[39m\n\n\n @ ./template/src/index.js 1:77-100 1:182-185\n @ multi ./config/polyfills.js ./template/src/index.js",
      ],
    };

    expect(formatWebpackMessages(json)).toMatchSnapshot();
  });

  it('export not found', () => {
    const json = {
      errors: [
        "./template/src/index.js 1:182-185\n\"export 'App' was not found in './App'\n @ multi ./config/polyfills.js ./template/src/index.js",
      ],
      warnings: [],
    };

    expect(formatWebpackMessages(json)).toMatchSnapshot();
  });
});
