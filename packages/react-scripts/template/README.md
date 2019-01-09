> _This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) +
> [backpack-react-scripts](https://github.com/Skyscanner/backpack-react-scripts/tree/master/packages/react-scripts)._
> It is very similar to one that you would create using [Create React App](https://github.com/facebook/create-react-app)
> without [backpack-react-scripts](https://github.com/Skyscanner/backpack-react-scripts/tree/master/packages/react-scripts),
> so please refer to [it's documentation](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md)
> for more usage information.

# [_Put your project name here_]

[_Add a brief description of your project here._]

## npm script commands

`backpack-react-scripts` is listed as a `devDependency` in your [package.json](./package.json) and exposes the following npm scripts:

- `npm start`: Runs the app in development mode. Open [http://localhost:3000/](http://localhost:3000/) to view it in the browser. The page will reload if you make edits. You will see the build errors in the console.
- `npm test`: Runs the test watcher in an interactive mode. By default, runs tests related to files changes since the last commit.
- `npm run build`: Builds the app for production to the build folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes. Your app is ready to be deployed!

## Excluding React / ReactDOM from the output bundle

Sometimes you need to exclude React (or any module) from your app's bundle for performance / code sharing reasons (i.e. if it's on the page already). To do this, add the following to your `package.json`:

```json
{
  ...
  "backpack-react-scripts": {
    "externals": {
      "react": "React",
      "react-dom": "ReactDOM"
    }
  }
}
```

Now when you run `npm run build`, every `'react'` / `'react-dom'` import is replaced with `window.React` / `window.ReactDOM`. You'll also notice that the output bundle size is dramatically smaller. _Note:_ You are responsible for ensuring that React is loaded before your app is!

## Server Side Rendering (SSR)

Most of the time you wont need server-side rendering, however if you need to generate your app's HTML on the server and send the markup down on the initial request to improve perceived page load or to allow search engines to crawl your pages for SEO purposes, then create a file named `ssr.js` in your app's root folder:

```
my-app/
  src/
    ...
    index.js
    ssr.js    // <-- create this file
```

Inside `ssr.js`, export the components that you wish to expose for server-side rendering - the file contents should look something like this:

```js
import App from './App';

export default { App };
```

Run `npm run build` as you would to build a production browser bundle - you should notice an additional `ssr.js` file in the output directory:

```
my-app/
  build/
    static/
    asset-manifest.json
    favicon.ico
    index.html
    ssr.js                // <-- new output file
```

This file can now be required and pre-rendered on the server like so (rough implementation):

`server.js`:

```js
const React = require('react');
const express = require('express');
const ReactDOMServer = require('react-dom/server');

const components = require('./my-app/build/ssr').default;

const router = express.Router();

router.get('/', (req, res) => {
  const element = React.createElement(components.App);
  const html = ReactDOMServer.renderToString(element);

  res.render('index', { html });
});

module.exports = router;
```

`index.html`:

```html
<div id="root">{{{html}}}</div>
```

If you call `ReactDOM.render()` on a node that already has this server-rendered markup (`<div id="root">` in the example above), React will preserve it and only attach event handlers, allowing you to have a very performant first-load experience.

**Note:** Your external module imports (anything you import from `node_modules/` i.e. `import React from 'react';`) are bundled into the `ssr.js` output file. If you want to exclude any external modules from the output file for performance / code sharing reasons (i.e. if it's being required elsewhere and is already in memory) you can do so by adding the following to your `package.json`:

```json
{
  ...
  "backpack-react-scripts": {
    "ssrExternals": [
      "react",
      "react-dom"
    ]
  }
}
```

## Compiling `node_modules` dependencies that contain JSX

By default, modules imported from your app's `node_modules` directory will get compiled by Babel with the caveat that only standard ES features are supported. If you need to compile modules that contain non-standard ES features, including JSX, you can use the following:

```json
{
  ...
  "backpack-react-scripts": {
    "babelIncludePrefixes": [
      "my-module-prefix-",
      "some-module"
    ]
  }
}
```

The above example assumes that the module you want to compile is named with the prefix `my-module-prefix-` and a module with the name `some-module`. All entries in this array act as prefixes. It is used by all Webpack configurations as well as the Jest configuration — if you want to avoid compiling a dependency in tests, you should mock it.

## Disabling AMD parsing for certain modules

If you need to disable AMD module support for whatever reason, you can add the following to your `package.json`:

```json
{
  ...
  "backpack-react-scripts": {
    "amdExcludes": [
      "globalize"
    ]
  }
}
```

The above example disables AMD support for the `globalize` dependency and overcomes issues such as:

```sh
Failed to compile.
./node_modules/globalize/dist/globalize.js
Module not found: Can't resolve 'cldr' in './node_modules/globalize/dist'
```

## Cross-origin loading of dynamic chunks

You can configure [cross-origin loading](https://webpack.js.org/configuration/output/#output-crossoriginloading) of dynamic chunks like so:

```json
  "backpack-react-scripts": {
    "crossOriginLoading": "anonymous"
  }
```

> **Note:** `lodash` is disabled by default.

## CSS Modules

All Sass files are by default treated as [CSS Modules](https://github.com/css-modules/css-modules). You can opt out of this behaviour using the following config option:

```
"backpack-react-scripts": {
  "cssModules": false
}
```

If you decide to opt out, Sass files will not be treated as CSS Modules by default. However, you can opt-in on a per-file basis using the naming convention: `*.module.scss`.

For example, with `cssModules` set to `false`:

- The file `App.scss` will not be treated as CSS Module
- The file `App.module.scss` _will_ be treated as CSS Module

This allows you to upgrade your project file by file to CSS Modules.

> Backpack components will _always_ be treated as CSS Modules, even if you opt out

## Upgrading `backpack-react-scripts`

The [Backpack team](mailto:backpack@skyscanner.net) provide ongoing maintenance and bugfixes to `backpack-react-scripts`. Please refer to
[it's changelog](https://github.com/Skyscanner/backpack-react-scripts/tree/master/packages/react-scripts/CHANGELOG.md) for upgrade guides.

## Adding your own custom build configuration

If you're finding the need to customise the configuration of `backpack-react-scripts`, then please get in touch with the [Backpack team](mailto:backpack@skyscanner.net) - we are open to contributions.

If this is unsuitable, then you can always run `npm run eject` which copies all the configuration files and the transitive dependencies (Webpack, Babel, etc) right into your project so you have full control over them. Commands like `npm start` and `npm run build` will still work, but they will point to the copied scripts so you can tweak them. At this point, you’re on your own.

**Note: this is a one-way operation - once you eject, you can’t go back!**

Please don't do this if you don't have to - the curated feature set is there to promote standardisation across Skyscanner's front-end stack.
