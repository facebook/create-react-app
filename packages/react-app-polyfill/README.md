# react-app-polyfill

This package includes polyfills for various browsers.
It includes minimum requirements and commonly used language features used by [Create React App](https://github.com/facebook/create-react-app) projects.

### Features

Each polyfill ensures the following language features are present:

1. `Promise` (for `async` / `await` support)
1. `window.fetch` (a Promise-based way to make web requests in the browser)
1. `Object.assign` (a helper required for Object Spread, i.e. `{ ...a, ...b }`)
1. `Symbol` (a built-in object used by `for...of` syntax and friends)
1. `Array.from` (a built-in static method used by array spread, i.e. `[...arr]`)

*If you need more features, you must include them manually.*

### Usage

First, install the package using Yarn or npm:

```bash
npm install react-app-polyfill
```

or

```bash
yarn add react-app-polyfill
```

Now, you can import the entry point for the minimal version you intend to support. For example, if you import the IE9 entry point, this will include IE10 and IE11 support.

#### Internet Explorer 9

```js
// This must be the first line in src/index.js
import 'react-app-polyfill/ie9';

// ...
```

#### Internet Explorer 11

```js
// This must be the first line in src/index.js
import 'react-app-polyfill/ie11';

// ...
```
