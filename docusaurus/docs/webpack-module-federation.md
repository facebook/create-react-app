---
id: webpack-module-federation
title: Webpack Module Federation
---

[Webpack Module Federation](https://webpack.js.org/concepts/module-federation) is a feature made available in Webpack 5.

## Configuring Webpack Module Federation
To get started, create `src/setupModuleFederation.js` and place the following contents in it:
```js
module.exports = {
  name: 'test',
  library: { type: 'var', name: 'test' },
  filename: 'remoteEntry.js',
  exposes: { '.': './src/App.js' }
}
```

You can now modify this configuration to suit your needs. [See here](https://webpack.js.org/plugins/module-federation-plugin#sharing-hints) for Module Federation Plugin's configuraiton options.

> **Note:** Since Micro-frontend apps do not typically have their own `index.html` (unless they're using iframes), the `index.html` file in the public folder is an optional file and can be removed if not applicable to your app.
