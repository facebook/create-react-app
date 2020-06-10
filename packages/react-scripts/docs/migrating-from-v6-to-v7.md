# Migrating from v6 to v7

Inside any created `backpack-react-scripts` project that has not been ejected, run:

```
npm install --save backpack-react-scripts@^7
```

## Breaking Changes

Like any major release, `backpack-react-scripts@7` contains a few breaking changes. At least one of them will affect every user, so please scan over these sections to see what is relevant to you.

### ESLint and Stylelint are no longer included by default, you have to manage them yourself

We have decoupled ESLint and Stylelint from this release. This is because the rate at which our configs (`eslint-config-skyscanner` and `stylelint-config-skyscanner`) change is much faster than the underlying functionality of `create-react-app`, causing unecessary churn.

That means that your `npm run lint:js` and `npm run lint:scss` scripts will no longer work if on `eslint-config-skyscanner@^4` or `stylelint-config-skyscanner@^1`. 

If on these older versions of our Skyscanner linting configurations and you do not wish to upgrade in this change you will need to install their peer dependencies. It is however recommended to upgrade to the latest of each, where not only will this not be a problem but you will benefit from the latest linting features and improvements.

If you do not wish to upgrade then you can install the required peer dependencies using:

ESLint

**Note:** `eslint-config-skyscanner-with-prettier` does not require peer dependencies, but has been deprecated in favour of `eslint-config-skyscanner` coming with Prettier inbuild by default from [`v5`](https://github.com/Skyscanner/eslint-config-skyscanner/blob/master/CHANGELOG.md).

```
npx install-peerdeps --dev eslint-config-skyscanner@^4
```

Stylelint

```
npx install-peerdeps --dev stylelint-config-skyscanner@^1
```

### Polyfills for IE 9, IE 10, and IE 11 are no longer included by default (but you can opt in!)

We have dropped default support for Internet Explorer 9, 10, and 11. If you still need to support these browsers, follow the instructions below.

First, install `react-app-polyfill`:

```
npm install react-app-polyfill
```

Next, place one of the following lines at the very top of `src/index.js`:

```
import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/ie11'; // For IE 11 support
```

You can read more about [these polyfills here](https://github.com/facebook/create-react-app/tree/master/packages/react-app-polyfill).

### Dynamic `import()` of a CommonJS module now has a `.default` property

[Webpack 4 changed the behavior of import()](https://medium.com/webpack/webpack-4-import-and-commonjs-d619d626b655) to be closer in line with the specification.

Previously, importing a CommonJS module did not require you specify the default export. In most cases, this is now required.
If you see errors in your application about `... is not a function`, you likely need to update your dynamic import, e.g.:

```
const throttle = await import('lodash/throttle');
// replace with
const throttle = await import('lodash/throttle').then(m => m.default);
```

### `require.ensure()` is superseded by dynamic `import()`

We previously allowed code splitting with a webpack-specific directive, `require.ensure()`. It is now disabled in favor of `import()`. To switch to `import()`, follow the examples below:

Single Module

```
require.ensure(['module-a'], function() {
  var a = require('module-a');
  // ...
});

// Replace with:
import('module-a').then(a => {
  // ...
});
```

Multiple Module

```
require.ensure(['module-a', 'module-b'], function() {
  var a = require('module-a');
  var b = require('module-b');
  // ...
});

// Replace with:
Promise.all([import('module-a'), import('module-b')]).then(([a, b]) => {
  // ...
});
```

### The default Jest environment was changed to `jsdom`

Look at the `test` entry in the `scripts` section of your package.json.
Here's a table how to change it from "before" and "after", depending on what you have there:

| 6.x (if you have this...)        | 7.x (...change it to this!)     |
| -------------------------------- | ------------------------------- |
| `react-scripts test --env=jsdom` | `react-scripts test`            |
| `react-scripts test`             | `react-scripts test --env=node` |

### Object proxy configuration is superseded by `src/setupProxy.js`

To check if action is required, look for the `proxy` key in `package.json` and follow this:

1. I couldn't find a `proxy` key in `package.json`
   - No action is required!
2. The value of `proxy` is a string (e.g. `http://localhost:5000`)
   - No action is required!
3. The value of `proxy` is an object
   - Follow the migration instructions below.

**It's worth highlighting: if your `proxy` field is a `string`, e.g. `http://localhost:5000`, or you don't have it, skip this section. This feature is still supported and has the same behavior.**

If your `proxy` is an object, that means you are using the advanced proxy configuration. It has become fully customizable so we removed the limited support for the object-style configuration. Here's how to recreate it.

First, install `http-proxy-middleware` using npm or Yarn:

```
npm install http-proxy-middleware
```

Next, create `src/setupProxy.js` and place the following contents in it:

```
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  // ...
};
```

Now, migrate each entry in your `proxy` object one by one, e.g.:

```
"proxy": {
  "/api": {
    "target": "http://localhost:5000/"
    },
  "/*.svg": {
    "target": "http://localhost:5000/"
  }
}
```

Place entries into `src/setupProxy.js` like so:

```
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/api', { target: 'http://localhost:5000/' }));
  app.use(proxy('/*.svg', { target: 'http://localhost:5000/' }));
};
```

You can also use completely custom logic there now! This wasn't possible before.

### `.mjs` file extension support is removed

Change the extension of any files in your project using `.mjs` to `.js`.

It was removed because of inconsistent support from underlying tools. We will add it back after it stops being experimental, and Jest gets built-in support for it.

### `PropTypes` definitions are now removed in production

Normally, this shouldn't affect your logic and should make the resulting bundle smaller. However, you may be relying on PropTypes definition for production logic. This is not recommended, and will break now. If a library does it, one possible solution is to file an issue in it with a proposal to use a different field (not propTypes) to signal that the declaration needs to be retained.

### Node 6 is no longer supported

Please upgrade to Node 8 (LTS) or later.
