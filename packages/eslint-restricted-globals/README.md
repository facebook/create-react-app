# eslint-restricted-globals [![npm](https://img.shields.io/npm/v/eslint-restricted-globals.svg?style=plastic)](https://www.npmjs.com/package/eslint-restricted-globals) [![npm](https://img.shields.io/npm/l/eslint-restricted-globals.svg?style=plastic)](https://www.npmjs.com/package/eslint-restricted-globals)

> A list of confusing globals that should be restricted to be used as globals

## Install

```
$ npm install --save eslint-restricted-globals
```

Some global variables in browser are likely to be used by people without the intent of using them as globals, such as `status`, `name` etc. 
And because eslint thinks of them as valid global variables, it does not warn in case of bugs.

For eg:
```js
function foo(nama) {
    if (nama) {
        console.log(name)
    }
}
```

Here we try to log variable `nama` if it is truthy, but by mistake we are logging `name` and as `name` is a valid global, no eslint warning is shown.

To avoid this, we blacklist such confusing globals which are exported from this package. It contains the list of variables that we think should not be used without `window.` qualifier. But as this is just a javascript array you can add, remove variables or even make your own list of variables.

## Usage

Add this in your eslint config in rules property:

```js
var restrictedGlobals = require('eslint-restricted-globals')

module.exports = {
    rules: {
        'no-restricted-globals': ['error'].concat(restrictedGlobals),
    }
}
```


## License

MIT 