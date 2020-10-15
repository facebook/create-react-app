# Magic

A frontend build tool, based on [create-react-app](https://github.com/facebook/create-react-app). It's a **black box** that compiles sass (`scss`) and javascript (`js` / `jsx`) files.

## Installation

`npm install @wieni/magic`.

In your Drupal 8 theme, add the folling to your `package.json`:

```
"scripts": {
  "build": "NODE_ENV=production magic build",
  "start": "NODE_ENV=development magic start",
}
```

## Config

Configuration is done in the `magic.config.js` file.

`entry`

These are all the **bundles** that should be compiled. An object with key-valye pairs: the _key_ is the output name of the bundle, the _value_ is the filename.

> **Note:** All bundles should be placed inside the `resources` folder.

```
module.exports = {
  entry: {
    global: "index.js",
  },
};
```

> In this example, `resources/index.js` in a bundle. The output is placed inside `public/resources/{files}`.

`alias`

This allows you to use (webpack) alias resolving.

> **Note:** All alias should be placed inside the `resources` folder.

```
module.exports = {
  ...,
  alias: {
    "@dashboard": "dashboard",
  },
};
```

> In this example, `@dashboard` will resolves files from `resources/dashboard`.

## Development config

Development configuration is done in the `magic.dev.config.js` file.

```
module.exports = {
  proxyPort: 3000,
  proxyTarget: "https://x.wieni.dev",
  proxyHost: "x.wieni.dev",
};
```

### Gitignore

Make sure to add `magic.dev.config.js` to your `.gitignore` file. This file is unique for
every developer. You can add a `magic.dev.config.example.js`, to provide a sample configuration.

## Usage

- `magic build`: Build the frontend.
- `magic start`: Run a development (proxy) server.

## Common problems

### Unable to resolve assets used in sass/css.

`ModuleNotFoundError: Module not found: Error: Can't resolve './components/category-menu/images/icon-triangle.svg' in '/public/themes/custom/drupack/resources'`

ℹ️ Fix the import by using `~`.

⛔️ The sass file contains an import `background-image: url("images/icon-triangle.svg");`.

✅ Change this import to `background-image: url("~images/icon-triangle.svg");`

### `Unexpected use of 'x'  no-restricted-globals`

`Line 47:9:  Unexpected use of 'history'  no-restricted-globals`

ℹ️ Compilation fails, because ESLint throws an error.

⛔️ You're calling a global variable, like `history` or `location`.

✅ `/*eslint-disable no-restricted-globals*/`

##

### My life sucks. I have to support IE11.

ℹ️ Well, might not be too hard …

✅ `npm install react-app-polyfill`

In your main bundle, add the following:

```js
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
```

Add `IE 11` to the browserlist in your `package.json`:

```json
  "browserslist": {
    "production": [
      "IE 11",
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
