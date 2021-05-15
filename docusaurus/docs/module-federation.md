---
id: module-federation
title: Module Federation
---

**EXPERIMENTAL!** This is feature is subject to change as we evaluate and gather feedback

Module federation enables an application to expose a module to be consumed by itself or other applications.

To enable module federation in a create react app add either a *.modulefederationrc.json* or *.modulefederationrc.js* in the root folder - depending on how dynamic the config needs to be.

The configuration is simply passed to the `ModuleFederationPlugin` [Read more about the configuration](https://webpack.js.org/concepts/module-federation/#modulefederationplugin-high-level) or [Find examples on module-federation](https://github.com/module-federation/module-federation-examples#module-federation-examples)

Examples:

App 1
```json
// .modulefederationrc.json
{
  "name": "app1",
  "remotes": {
    "app2": "app2@http://localhost:3002/remoteEntry.js"
  },
  "shared": ["react", "react-dom"]
}
```

App 2
```js
// .modulefederationrc.js
module.exports = {
  name: "app2",
  filename: "remoteEntry.js",
  exposes: {
    "./Button": "./src/Button"
  },
  shared: ["react", "react-dom"],
};
```

Note:
Currently there is not a template for creating an app with federated modules, but rename eg. the `index.js` to `bootstrap.js` and add a new `index.js` with the following code:
```js
import("./bootstrap");
```