---
id: importing-a-component
title: Importing a Component
---

This project setup supports ES6 modules thanks to webpack.

While you can still use `require()` and `module.exports`, we encourage you to use [`import` and `export`](http://exploringjs.com/es6/ch_modules.html) instead.

For example:

## `Button.js`

```js
import React, { Component } from 'react';

class Button extends Component {
  render() {
    // ...
  }
}

export default Button; // Don’t forget to use export default!
```

## `DangerButton.js`

```js
import React, { Component } from 'react';
import Button from './Button'; // Import a component from another file

class DangerButton extends Component {
  render() {
    return <Button color="red" />;
  }
}

export default DangerButton;
```

Be aware of the [difference between default and named exports](https://stackoverflow.com/questions/36795819/react-native-es-6-when-should-i-use-curly-braces-for-import/36796281#36796281). It is a common source of mistakes.

We suggest that you stick to using default imports and exports when a module only exports a single thing (for example, a component). That’s what you get when you use `export default Button` and `import Button from './Button'`.

Named exports are useful for utility modules that export several functions. A module may have at most one default export and as many named exports as you like.

Learn more about ES6 modules:

- [When to use the curly braces?](https://stackoverflow.com/questions/36795819/react-native-es-6-when-should-i-use-curly-braces-for-import/36796281#36796281)
- [Exploring ES6: Modules](http://exploringjs.com/es6/ch_modules.html)
- [Understanding ES6: Modules](https://leanpub.com/understandinges6/read#leanpub-auto-encapsulating-code-with-modules)

## Absolute Imports

You can configure your application to support importing modules using absolute paths. This can be done by configuring a `jsconfig.json` or `tsconfig.json` file in the root of your project. If you're using TypeScript in your project, you will already have a `tsconfig.json` file.

Below is an example `jsconfig.json` file for a JavaScript project. You can create the file if it doesn't already exist:

```json
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
```

If you're using TypeScript, you can configure the `baseUrl` setting inside the `compilerOptions` of your project's `tsconfig.json` file.

Now that you've configured your project to support absolute imports, if you want to import a module located at `src/components/Button.js`, you can import the module like so:

```js
import Button from 'components/Button';
```

For more information on these configuration files, see the [jsconfig.json reference](https://code.visualstudio.com/docs/languages/jsconfig) and [tsconfig.json reference](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) documentation.
