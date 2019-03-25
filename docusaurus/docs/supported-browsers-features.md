---
id: supported-browsers-features
title: Supported Browsers and Features
sidebar_label: Supported Browsers and Features
---

## Supported Browsers

By default, the generated project supports all modern browsers. Support for Internet Explorer 9, 10, and 11 requires polyfills. For a minimum set of polyfills to support older browsers, use [react-app-polyfill](https://github.com/facebook/create-react-app/blob/master/packages/react-app-polyfill/README.md). To polyfill other language features, see the [Adding Polyfills](#adding-polyfills) section below

## Supported Language Features

This project supports a superset of the latest JavaScript standard. In addition to [ES6](https://github.com/lukehoban/es6features) syntax features, it also supports:

- [Exponentiation Operator](https://github.com/rwaldron/exponentiation-operator) (ES2016).
- [Async/await](https://github.com/tc39/ecmascript-asyncawait) (ES2017).
- [Object Rest/Spread Properties](https://github.com/tc39/proposal-object-rest-spread) (ES2018).
- [Dynamic import()](https://github.com/tc39/proposal-dynamic-import) (stage 3 proposal)
- [Class Fields and Static Properties](https://github.com/tc39/proposal-class-public-fields) (part of stage 3 proposal).
- [JSX](https://facebook.github.io/react/docs/introducing-jsx.html), [Flow](./adding-flow) and [TypeScript](./adding-typescript).

Learn more about [different proposal stages](https://tc39.github.io/process-document/).

While we recommend using experimental proposals with some caution, Facebook heavily uses these features in the product code, so we intend to provide [codemods](https://medium.com/@cpojer/effective-javascript-codemods-5a6686bb46fb) if any of these proposals change in the future.

Note that **this project includes no [polyfills](https://github.com/facebook/create-react-app/blob/master/packages/react-app-polyfill/README.md)** by default.

If you use any other ES6+ features that need **runtime support** (such as `Array.from()` or `Symbol`), make sure you are [including the appropriate polyfills manually](https://github.com/facebook/create-react-app/blob/master/packages/react-app-polyfill/README.md), or that the browsers you are targeting already support them.

## Adding Polyfills

You can install [`@babel/polyfill`](https://babeljs.io/docs/en/babel-polyfill) as a dependency in your application, and import it at the very top of your app's entry point (`src/index.js` or `src/index.tsx`) to emulate a full ES2015+ environment. Your `browerslist` configuration will be used to only include the polyfills necessary by your target browsers.

## Configuring Supported Browsers

By default, the generated project includes a [`browerslist`](https://github.com/browserslist/browserslist) configuration in your `package.json` file to target a broad range of browsers based on global usage (`> 0.2%`) for production builds, and modern browsers for development. This gives a good development experience, especially when using language features such as async/await, but still provides high compatibility with many browsers in production.

The `browserslist` configuration controls the outputted JavaScript so that the emitted code will be compatible with the browsers specified. The `production` list will be used when creating a production build by running the `build` script, and the `development` list will be used when running the `start` script. You can use [https://browserl.ist](https://browserl.ist/?q=%3E+0.2%25%2C+not+dead%2C+not+op_mini+all) to see the browsers supported by your configured `browserslist`.

Here is an example `browserslist` that is specified in `package.json`:

```json
"browserslist": {
  "production": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ],
  "development": [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version"
  ]
}
```

> Note that this does not include polyfills automatically for you. You will still need to polyfill language features (see above) as needed based on the browsers your are supporting.

> When editing the `browerslist` config, you may notice that your changes don't get picked up right away. This is due to an [issue in babel-loader](https://github.com/babel/babel-loader/issues/690) not detecting the change in your `package.json`. An easy solution is to delete the `node_modules/.cache` folder and try again.
