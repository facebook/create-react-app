# react-app-polyfill

This package includes polyfills for various browsers.
It includes minimum requirements and commonly used language features used by [Create React App](https://github.com/facebook/create-react-app) projects.

### Usage

First, install the package using Yarn or npm:

```sh
npm install react-app-polyfill
```

or

```sh
yarn add react-app-polyfill
```

## Supporting Internet Explorer

You can import the entry point for the minimal version you intend to support to ensure that the minimum langauge features are present that are required to use Create React App. For example, if you import the IE9 entry point, this will include IE10 and IE11 support.

These modules ensures the following language features are present:

1. `Promise` (for `async` / `await` support)
1. `window.fetch` (a Promise-based way to make web requests in the browser)
1. `Object.assign` (a helper required for Object Spread, i.e. `{ ...a, ...b }`)
1. `Symbol` (a built-in object used by `for...of` syntax and friends)
1. `Array.from` (a built-in static method used by array spread, i.e. `[...arr]`)

_If you need more features, see the [Polyfilling other language features](#polyfilling-other-language-features) section below._

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

## Polyfilling other language features

You can also polyfill stable language features not available in your target browsers. If you're using this in Create React App, it will automatically use the `browserslist` you've defined to only include polyfills needed by your target browsers when importing the `stable` polyfill. **Make sure to follow the Internet Explorer steps above if you need to support Internet Explorer in your application**.

```js
// This must be the first line in src/index.js
import 'react-app-polyfill/stable';

// ...
```

If you are supporting Internet Explorer 9/11 you should include both the `ie9`/`ie11` and `stable` modules:

For IE9:

```js
// These must be the first lines in src/index.js
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

// ...
```

For IE11:

```js
// These must be the first lines in src/index.js
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

// ...
```
