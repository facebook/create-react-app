# react-dev-utils

This package includes some utilities used by [Create React App](https://github.com/facebookincubator/create-react-app).  
Please refer to its documentation:

* [Getting Started](https://github.com/facebookincubator/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.

## Usage in Create React App Projects

These utilities come by default with [Create React App](https://github.com/facebookincubator/create-react-app), which includes it by default. **You don’t need to install it separately in Create React App projects.**

## Usage Outside of Create React App

If you don’t use Create React App, or if you [ejected](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject), you may keep using these utilities. Their development will be aligned with Create React App, so major versions of these utilities may come out relatively often. Feel free to fork or copy and paste them into your projects if you’d like to have more control over them, or feel free to use the old versions. Not all of them are React-specific, but we might make some of them more React-specific in the future.

### Entry Points

There is no single entry point. You can only import individual top-level modules.

#### `new InterpolateHtmlPlugin(replacements: {[key:string]: string})`

This Webpack plugin lets us interpolate custom variables into `index.html`.  
It works in tandem with [HtmlWebpackPlugin](https://github.com/ampedandwired/html-webpack-plugin) 2.x via its [events](https://github.com/ampedandwired/html-webpack-plugin#events).

```js
var path = require('path');
var HtmlWebpackPlugin = require('html-dev-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

// Webpack config
var publicUrl = '/my-custom-url';

module.exports = {
  output: {
    // ...
    publicPath: publicUrl + '/' 
  },
  // ...
  plugins: [
    // Makes the public URL available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    new InterpolateHtmlPlugin({
      PUBLIC_URL: publicUrl
      // You can pass any key-value pairs, this was just an example.
      // WHATEVER: 42 will replace %WHATEVER% with 42 in index.html.
    }),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve('public/index.html'),
    }),
    // ...
  ],
  // ...
}
```

#### `new WatchMissingNodeModulesPlugin(nodeModulesPath: string)`

This Webpack plugin ensures `npm install <library>` forces a project rebuild.  
We’re not sure why this isn't Webpack's default behavior.  
See [#186](https://github.com/facebookincubator/create-react-app/issues/186) for details.

```js
var path = require('path');
var WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');

// Webpack config
module.exports = {
  // ...
  plugins: [
    // ...
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(path.resolve('node_modules'))
  ],
  // ...
}
```

#### `checkRequiredFiles(files: Array<string>): boolean`

Makes sure that all passed files exist.  
Filenames are expected to be absolute.  
If a file is not found, prints a warning message and returns `false`.

```js
var path = require('path');
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

if (!checkRequiredFiles([
  path.resolve('public/index.html'),
  path.resolve('src/index.js')
])) {
  process.exit(1);
}
```

#### `clearConsole(): void`

Clears the console, hopefully in a cross-platform way.

```js
var clearConsole = require('react-dev-utils/clearConsole');

clearConsole();
console.log('Just cleared the screen!');
```

#### `formatWebpackMessages({errors: Array<string>, warnings: Array<string>}): {errors: Array<string>, warnings: Array<string>}`

Extracts and prettifies warning and error messages from webpack [stats](https://github.com/webpack/docs/wiki/node.js-api#stats) object.

```js
var webpack = require('webpack');
var config = require('../config/webpack.config.dev');

var compiler = webpack(config);

compiler.plugin('invalid', function() {
  console.log('Compiling...');
});

compiler.plugin('done', function(stats) {
  var rawMessages = stats.toJson({}, true);
  var messages = formatWebpackMessages(rawMessages);
  if (!messages.errors.length && !messages.warnings.length) {
    console.log('Compiled successfully!');
  }
  if (messages.errors.length) {
    console.log('Failed to compile.');
    messages.errors.forEach(console.log);
    return;
  }
  if (messages.warnings.length) {
    console.log('Compiled with warnings.');
    messages.warnings.forEach(console.log);
  }
});
```

#### `getProcessForPort(port: number): string`

Finds the currently running process on `port`.
Returns a string containing the name and directory, e.g.,

```
create-react-app
in /Users/developer/create-react-app
```

```js
var getProcessForPort = require('react-dev-utils/getProcessForPort');

getProcessForPort(3000);
```

#### `openBrowser(url: string): boolean`

Attempts to open the browser with a given URL.  
On Mac OS X, attempts to reuse an existing Chrome tab via AppleScript.  
Otherwise, falls back to [opn](https://github.com/sindresorhus/opn) behavior.


```js
var path = require('path');
var openBrowser = require('react-dev-utils/openBrowser');

if (openBrowser('http://localhost:3000')) {
  console.log('The browser tab has been opened!');
}
```

#### `prompt(message: string, isYesDefault: boolean): Promise<boolean>`

This function displays a console prompt to the user.

By convention, "no" should be the conservative choice.  
If you mistype the answer, we'll always take it as a "no".  
You can control the behavior on `<Enter>` with `isYesDefault`.

```js
var prompt = require('react-dev-utils/prompt');
prompt(
  'Are you sure you want to eat all the candy?',
  /* isYesDefault */ false
).then(shouldEat => {
  if (shouldEat) {
    console.log('You have successfully consumed all the candy.');
  } else {
    console.log('Phew, candy is still available!');
  }
});
```

#### `webpackHotDevClient.js`

This is an alternative client for [WebpackDevServer](https://github.com/webpack/webpack-dev-server) that shows a syntax error overlay.

It currently supports only Webpack 1.x.

```js
// Webpack development config
module.exports = {
  // ...
  entry: [
    // You can replace the line below with these two lines if you prefer the
    // stock client:
    // require.resolve('webpack-dev-server/client') + '?/',
    // require.resolve('webpack/hot/dev-server'),
    'react-dev-utils/webpackHotDevClient',
    'src/index'
  ],
  // ...
}
```
